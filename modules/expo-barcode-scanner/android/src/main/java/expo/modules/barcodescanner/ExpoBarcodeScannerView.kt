package expo.modules.barcodescanner

import android.annotation.SuppressLint
import android.content.Context
import android.util.Base64
import android.util.Log
import android.util.Size
import android.view.SurfaceView
import android.view.TextureView
import android.widget.FrameLayout
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.google.mlkit.vision.barcode.BarcodeScanner
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class ExpoBarcodeScannerView(
    context: Context,
    appContext: AppContext,
) : ExpoView(context, appContext) {
    private val onBarcodeScanned by EventDispatcher()

    private var previewView: PreviewView
    private var cameraProvider: ProcessCameraProvider? = null
    private var cameraExecutor: ExecutorService
    private var barcodeScanner: BarcodeScanner
    private var currentFacing = CameraSelector.LENS_FACING_BACK
    private var isScanning = false
    private var isBound = false
    private var hasLoggedFrame = false

    companion object {
        private const val TAG = "ExpoBarcodeScannerView"
    }

    init {
        // ExpoView extends LinearLayout - ensure it fills vertically
        orientation = VERTICAL

        // Wrap PreviewView in FrameLayout for proper layout behavior
        val container = FrameLayout(context)
        container.setBackgroundColor(0x00000000)
        previewView =
            PreviewView(context).apply {
                implementationMode = PreviewView.ImplementationMode.COMPATIBLE
                scaleType = PreviewView.ScaleType.FILL_CENTER
                setBackgroundColor(0x00000000)
            }
        container.addView(
            previewView,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT,
            ),
        )
        addView(container, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT, 1f))

        Log.d(TAG, "PreviewView added in FrameLayout container")

        cameraExecutor = Executors.newSingleThreadExecutor()

        val options =
            BarcodeScannerOptions
                .Builder()
                .setBarcodeFormats(
                    Barcode.FORMAT_QR_CODE,
                    Barcode.FORMAT_AZTEC,
                    Barcode.FORMAT_PDF417,
                    Barcode.FORMAT_DATA_MATRIX,
                    Barcode.FORMAT_EAN_13,
                    Barcode.FORMAT_EAN_8,
                    Barcode.FORMAT_UPC_A,
                    Barcode.FORMAT_UPC_E,
                    Barcode.FORMAT_CODE_128,
                    Barcode.FORMAT_CODE_39,
                    Barcode.FORMAT_CODE_93,
                    Barcode.FORMAT_CODABAR,
                    Barcode.FORMAT_ITF,
                ).build()

        barcodeScanner = BarcodeScanning.getClient(options)

        Log.d(TAG, "View initialized")
    }

    // React Native requires manual measure/layout for proper TextureView surface creation
    // Without this, requestLayout() is often no-op'd and the surface never gets created
    private val measureAndLayout = Runnable {
        measure(
            MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
        )
        layout(left, top, right, bottom)
    }

    override fun requestLayout() {
        super.requestLayout()
        // Post to ensure the measure/layout happens after React Native's layout pass
        post(measureAndLayout)
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        Log.d(TAG, "onAttachedToWindow")
        // Delay camera start until PreviewView has been laid out
        // This ensures the surface is ready in React Native's view hierarchy
        previewView.post {
            if (previewView.width > 0 && previewView.height > 0) {
                startCamera()
            } else {
                // Wait for layout if dimensions aren't ready yet
                previewView.viewTreeObserver.addOnGlobalLayoutListener(object : android.view.ViewTreeObserver.OnGlobalLayoutListener {
                    override fun onGlobalLayout() {
                        if (previewView.width > 0 && previewView.height > 0) {
                            previewView.viewTreeObserver.removeOnGlobalLayoutListener(this)
                            Log.d(TAG, "PreviewView layout ready: ${previewView.width}x${previewView.height}")
                            startCamera()
                        }
                    }
                })
            }
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        Log.d(TAG, "onDetachedFromWindow")
        stopCamera()
    }

    override fun onLayout(
        changed: Boolean,
        l: Int,
        t: Int,
        r: Int,
        b: Int,
    ) {
        super.onLayout(changed, l, t, r, b)
        Log.d(TAG, "onLayout: view=${r - l}x${b - t}, previewView=${previewView.width}x${previewView.height}")
    }

    fun setFacing(facing: String) {
        Log.d(TAG, "setFacing: $facing")
        val newFacing =
            when (facing) {
                "front" -> CameraSelector.LENS_FACING_FRONT
                else -> CameraSelector.LENS_FACING_BACK
            }
        if (newFacing != currentFacing) {
            currentFacing = newFacing
            // Rebind camera with new facing
            if (isBound) {
                stopCamera()
                startCamera()
            }
        }
    }

    private fun getLifecycleOwner(): LifecycleOwner? = appContext.currentActivity as? LifecycleOwner

    private fun startCamera() {
        if (isBound) return

        val lifecycleOwner = getLifecycleOwner()
        if (lifecycleOwner == null) {
            Log.e(TAG, "No lifecycle owner available")
            return
        }

        Log.d(TAG, "Starting camera with ProcessCameraProvider")

        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        cameraProviderFuture.addListener({
            try {
                cameraProvider = cameraProviderFuture.get()
                Log.d(TAG, "CameraProvider obtained")
                bindCameraUseCases(lifecycleOwner)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to get camera provider", e)
            }
        }, ContextCompat.getMainExecutor(context))
    }

    private fun bindCameraUseCases(lifecycleOwner: LifecycleOwner) {
        val provider = cameraProvider ?: return

        // Unbind all before rebinding
        provider.unbindAll()

        val hasBackCamera =
            try {
                provider.hasCamera(CameraSelector.DEFAULT_BACK_CAMERA)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to check back camera availability", e)
                false
            }
        val hasFrontCamera =
            try {
                provider.hasCamera(CameraSelector.DEFAULT_FRONT_CAMERA)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to check front camera availability", e)
                false
            }

        val resolvedFacing =
            when {
                currentFacing == CameraSelector.LENS_FACING_BACK && hasBackCamera -> currentFacing
                currentFacing == CameraSelector.LENS_FACING_FRONT && hasFrontCamera -> currentFacing
                hasBackCamera -> CameraSelector.LENS_FACING_BACK
                hasFrontCamera -> CameraSelector.LENS_FACING_FRONT
                else -> currentFacing
            }

        if (resolvedFacing != currentFacing) {
            Log.d(TAG, "Requested camera not available, falling back")
            currentFacing = resolvedFacing
        }

        if (!hasBackCamera && !hasFrontCamera) {
            Log.e(TAG, "No cameras available on device")
            return
        }

        val cameraSelector =
            CameraSelector
                .Builder()
                .requireLensFacing(currentFacing)
                .build()

        // Preview use case
        val preview = Preview.Builder().build()
        Log.d(TAG, "PreviewView visibility=${previewView.visibility}, width=${previewView.width}, height=${previewView.height}")

        // Set surface provider BEFORE binding - ensures surface is ready when camera connects
        Log.d(TAG, "Setting surface provider before bind")
        preview.setSurfaceProvider(previewView.surfaceProvider)

        // Image analysis for barcode scanning
        val imageAnalysis =
            ImageAnalysis
                .Builder()
                .setTargetResolution(Size(1280, 720))
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()
                .also {
                    it.setAnalyzer(cameraExecutor) { imageProxy ->
                        processImageProxy(imageProxy)
                    }
                }

        try {
            val camera =
                provider.bindToLifecycle(
                    lifecycleOwner,
                    cameraSelector,
                    preview,
                    imageAnalysis,
                )
            isBound = true
            Log.d(TAG, "Camera bound successfully, camera: $camera")

            previewView.previewStreamState.removeObservers(lifecycleOwner)
            previewView.previewStreamState.observe(lifecycleOwner) { state ->
                Log.d(TAG, "Preview stream state: $state")
            }

            camera.cameraInfo.cameraState.removeObservers(lifecycleOwner)
            camera.cameraInfo.cameraState.observe(lifecycleOwner) { state ->
                Log.d(TAG, "Camera state: ${state.type}")
            }

            // Fix SurfaceView z-ordering in React Native view hierarchy
            fixSurfaceViewZOrder()

            Log.d(TAG, "Camera binding complete")
        } catch (e: Exception) {
            Log.e(TAG, "Use case binding failed", e)
        }
    }

    private fun stopCamera() {
        Log.d(TAG, "stopCamera called")
        isBound = false
        isScanning = false
        cameraProvider?.unbindAll()
    }

    private fun fixSurfaceViewZOrder() {
        // PreviewView contains either a SurfaceView or TextureView
        // SurfaceView needs z-order fix in React Native
        previewView.post {
            for (i in 0 until previewView.childCount) {
                val child = previewView.getChildAt(i)
                Log.d(TAG, "PreviewView child $i: ${child.javaClass.simpleName}")
                if (child is SurfaceView) {
                    Log.d(TAG, "Setting SurfaceView setZOrderMediaOverlay(true)")
                    child.setZOrderMediaOverlay(true)
                }
            }
        }
    }

    @SuppressLint("UnsafeOptInUsageError")
    private fun processImageProxy(imageProxy: ImageProxy) {
        val mediaImage = imageProxy.image
        if (mediaImage != null) {
            if (!hasLoggedFrame) {
                hasLoggedFrame = true
                Log.d(
                    TAG,
                    "Received frame: ${mediaImage.width}x${mediaImage.height}, rotation=${imageProxy.imageInfo.rotationDegrees}",
                )
            }
            val image =
                com.google.mlkit.vision.common.InputImage.fromMediaImage(
                    mediaImage,
                    imageProxy.imageInfo.rotationDegrees,
                )

            barcodeScanner
                .process(image)
                .addOnSuccessListener { barcodes ->
                    if (barcodes.isNotEmpty() && !isScanning) {
                        handleBarcodeScanned(barcodes[0])
                    }
                }.addOnCompleteListener {
                    imageProxy.close()
                }
        } else {
            if (!hasLoggedFrame) {
                hasLoggedFrame = true
                Log.d(TAG, "Received null mediaImage from imageProxy")
            }
            imageProxy.close()
        }
    }

    private fun handleBarcodeScanned(barcode: Barcode) {
        if (isScanning) return
        isScanning = true

        val data = barcode.rawValue ?: ""
        val rawBytes = barcode.rawBytes
        val rawData =
            if (rawBytes != null) {
                Base64.encodeToString(rawBytes, Base64.NO_WRAP)
            } else {
                ""
            }
        val type = mapBarcodeFormat(barcode.format)

        Log.d(TAG, "Barcode scanned: type=$type, dataLength=${data.length}, rawDataLength=${rawData.length}")

        post {
            onBarcodeScanned(
                mapOf(
                    "data" to data,
                    "rawData" to rawData,
                    "type" to type,
                ),
            )
        }
    }

    private fun mapBarcodeFormat(format: Int): String =
        when (format) {
            Barcode.FORMAT_QR_CODE -> "qr"
            Barcode.FORMAT_AZTEC -> "aztec"
            Barcode.FORMAT_PDF417 -> "pdf417"
            Barcode.FORMAT_DATA_MATRIX -> "datamatrix"
            Barcode.FORMAT_EAN_13 -> "ean13"
            Barcode.FORMAT_EAN_8 -> "ean8"
            Barcode.FORMAT_UPC_A -> "upc_a"
            Barcode.FORMAT_UPC_E -> "upc_e"
            Barcode.FORMAT_CODE_128 -> "code128"
            Barcode.FORMAT_CODE_39 -> "code39"
            Barcode.FORMAT_CODE_93 -> "code93"
            Barcode.FORMAT_CODABAR -> "codabar"
            Barcode.FORMAT_ITF -> "itf14"
            else -> "unknown"
        }
}

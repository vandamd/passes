package expo.modules.barcodescanner

import android.Manifest
import expo.modules.interfaces.permissions.Permissions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoBarcodeScannerModule : Module() {
    private val permissionsManager: Permissions
        get() = appContext.permissions ?: throw Exceptions.PermissionsModuleNotFound()

    override fun definition() = ModuleDefinition {
        Name("ExpoBarcodeScannerModule")

        AsyncFunction("getCameraPermissionsAsync") { promise: Promise ->
            Permissions.getPermissionsWithPermissionsManager(
                permissionsManager,
                promise,
                Manifest.permission.CAMERA
            )
        }

        AsyncFunction("requestCameraPermissionsAsync") { promise: Promise ->
            Permissions.askForPermissionsWithPermissionsManager(
                permissionsManager,
                promise,
                Manifest.permission.CAMERA
            )
        }

        AsyncFunction("startScanning") {
            // Scanning is handled by the view
        }

        AsyncFunction("stopScanning") {
            // Scanning is handled by the view
        }

        View(ExpoBarcodeScannerView::class) {
            Events("onBarcodeScanned")

            Prop("facing") { view: ExpoBarcodeScannerView, facing: String ->
                view.setFacing(facing)
            }
        }
    }
}

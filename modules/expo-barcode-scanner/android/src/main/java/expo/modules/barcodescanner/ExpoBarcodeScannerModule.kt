package expo.modules.barcodescanner

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoBarcodeScannerModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("ExpoBarcodeScannerModule")

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

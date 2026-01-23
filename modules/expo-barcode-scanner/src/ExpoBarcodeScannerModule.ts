import { requireNativeModule, requireNativeViewManager } from 'expo-modules-core';
import { ViewProps } from 'react-native';
import { BarcodeType } from '@/types/pass';

export interface BarcodeResult {
    data: string;
    rawData: string;
    type: BarcodeType;
}

export interface BarcodeScannerViewProps extends ViewProps {
    facing?: 'front' | 'back';
    onBarcodeScanned?: (event: { nativeEvent: BarcodeResult }) => void;
}

interface ExpoBarcodeScannerModuleType {
    startScanning(): Promise<void>;
    stopScanning(): Promise<void>;
}

export const ExpoBarcodeScannerView = requireNativeViewManager<BarcodeScannerViewProps>('ExpoBarcodeScannerModule');

export default requireNativeModule<ExpoBarcodeScannerModuleType>('ExpoBarcodeScannerModule');

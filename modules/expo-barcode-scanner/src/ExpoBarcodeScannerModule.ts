import {
    requireNativeModule,
    requireNativeViewManager,
    createPermissionHook,
    PermissionResponse
} from 'expo-modules-core';
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
    getCameraPermissionsAsync(): Promise<PermissionResponse>;
    requestCameraPermissionsAsync(): Promise<PermissionResponse>;
}

const ExpoBarcodeScannerModule = requireNativeModule<ExpoBarcodeScannerModuleType>('ExpoBarcodeScannerModule');

export const ExpoBarcodeScannerView = requireNativeViewManager<BarcodeScannerViewProps>('ExpoBarcodeScannerModule');

export async function getCameraPermissionsAsync(): Promise<PermissionResponse> {
    return ExpoBarcodeScannerModule.getCameraPermissionsAsync();
}

export async function requestCameraPermissionsAsync(): Promise<PermissionResponse> {
    return ExpoBarcodeScannerModule.requestCameraPermissionsAsync();
}

export const useCameraPermissions = createPermissionHook({
    getMethod: getCameraPermissionsAsync,
    requestMethod: requestCameraPermissionsAsync,
});

export default ExpoBarcodeScannerModule;

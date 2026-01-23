import React, { useState, useCallback, useRef } from "react";
import { View, StyleSheet, Button, Linking, Alert } from "react-native";
import { StyledText } from "@/components/StyledText";
import {
    CameraType,
    CameraView,
    useCameraPermissions,
    BarcodeScanningResult,
} from "expo-camera";
import ContentContainer from "@/components/ContentContainer";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { n } from "@/utils/scaling";

const SCAN_COOLDOWN_MS = 2000;

const isValidUrl = (url: string): boolean => {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
        return false;
    }
};

export default function ScanScreen() {
    const { invertColors } = useInvertColors();
    const [facing, setFacing] = useState<CameraType>("back");
    const [permission, requestPermission] = useCameraPermissions();
    const [isScanning, setIsScanning] = useState(true);
    const lastScannedRef = useRef<string | null>(null);
    const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSwapCamera = useCallback(() => {
        setFacing((current) => (current === "back" ? "front" : "back"));
    }, []);

    const handleBarcodeScanned = useCallback(
        async (scanningResult: BarcodeScanningResult) => {
            const data = scanningResult.data;

            if (!isScanning || lastScannedRef.current === data) {
                return;
            }

            setIsScanning(false);
            lastScannedRef.current = data;

            if (isValidUrl(data)) {
                try {
                    const supported = await Linking.canOpenURL(data);
                    if (supported) {
                        await Linking.openURL(data);
                    } else {
                        Alert.alert("Error", "Cannot open this URL");
                    }
                } catch {
                    Alert.alert("Error", "Failed to open URL");
                }
            } else {
                Alert.alert("Not a URL", `Scanned: ${data}`);
            }

            if (scanTimeoutRef.current) {
                clearTimeout(scanTimeoutRef.current);
            }
            scanTimeoutRef.current = setTimeout(() => {
                setIsScanning(true);
                lastScannedRef.current = null;
            }, SCAN_COOLDOWN_MS);
        },
        [isScanning]
    );

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        const textColor = invertColors ? "black" : "white";
        return (
            <ContentContainer headerTitle="Scan QR Code">
                <View style={styles.permissionContainer}>
                    <StyledText style={[styles.permissionText, { color: textColor }]}>
                        We need your permission to show the camera
                    </StyledText>
                    <Button onPress={requestPermission} title="Grant Permission" />
                </View>
            </ContentContainer>
        );
    }

    return (
        <ContentContainer
            headerTitle="Scan QR Code"
            rightIcon="flip-camera-ios"
            onRightIconPress={handleSwapCamera}
            style={styles.contentContainer}
        >
            <CameraView
                style={styles.camera}
                facing={facing}
                onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            />
        </ContentContainer>
    );
}

const styles = StyleSheet.create({
    permissionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    permissionText: {
        textAlign: "center",
        marginBottom: n(10),
    },
    contentContainer: {
        paddingHorizontal: 0,
        gap: 0,
    },
    camera: {
        height: "100%",
        width: "100%",
    },
});

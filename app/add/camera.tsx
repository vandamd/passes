import React, { useState, useCallback, useRef } from "react";
import { View, StyleSheet, Button } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
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
import { SUPPORTED_BARCODE_TYPES } from "@/types/pass";

const SCAN_DEBOUNCE_MS = 500;

export default function CameraScreen() {
    const router = useRouter();
    const { invertColors } = useInvertColors();
    const [facing, setFacing] = useState<CameraType>("back");
    const [permission, requestPermission] = useCameraPermissions();
    const lastScanRef = useRef<number>(0);

    const handleSwapCamera = useCallback(() => {
        setFacing((current) => (current === "back" ? "front" : "back"));
    }, []);

    const handleBarcodeScanned = useCallback(
        (scanningResult: BarcodeScanningResult) => {
            const now = Date.now();
            if (now - lastScanRef.current < SCAN_DEBOUNCE_MS) {
                return;
            }
            lastScanRef.current = now;

            const data = scanningResult.data;
            const type = scanningResult.type;
            router.push({
                pathname: "/pass-name",
                params: {
                    scannedData: data,
                    scannedType: type,
                },
            });
        },
        [router]
    );

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        const textColor = invertColors ? "black" : "white";
        return (
            <ContentContainer headerTitle="Add Pass">
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
            headerTitle="Add Pass"
            rightIcon="flip-camera-ios"
            onRightIconPress={handleSwapCamera}
            style={styles.contentContainer}
        >
            <CameraView
                style={styles.camera}
                facing={facing}
                onBarcodeScanned={handleBarcodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: [...SUPPORTED_BARCODE_TYPES],
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

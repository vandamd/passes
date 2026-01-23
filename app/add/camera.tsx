import React, { useState, useCallback, useRef } from "react";
import { View, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router";
import { StyledText } from "@/components/StyledText";
import { useCameraPermissions } from "expo-camera";
import ContentContainer from "@/components/ContentContainer";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { n } from "@/utils/scaling";
import { ExpoBarcodeScannerView, BarcodeResult } from "@/modules/expo-barcode-scanner";

const SCAN_DEBOUNCE_MS = 500;

export default function CameraScreen() {
    const router = useRouter();
    const { invertColors } = useInvertColors();
    const [facing, setFacing] = useState<"front" | "back">("back");
    const [permission, requestPermission] = useCameraPermissions();
    const lastScanRef = useRef<number>(0);

    const handleSwapCamera = useCallback(() => {
        setFacing((current) => (current === "back" ? "front" : "back"));
    }, []);

    const handleBarcodeScanned = useCallback(
        (event: { nativeEvent: BarcodeResult }) => {
            const now = Date.now();
            if (now - lastScanRef.current < SCAN_DEBOUNCE_MS) {
                return;
            }
            lastScanRef.current = now;

            const { data, rawData, type } = event.nativeEvent;
            router.push({
                pathname: "/pass-name",
                params: {
                    scannedData: data,
                    scannedRawData: rawData,
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
            <View style={styles.cameraContainer}>
                <ExpoBarcodeScannerView
                    style={styles.camera}
                    facing={facing}
                    onBarcodeScanned={handleBarcodeScanned}
                />
            </View>
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
        paddingTop: 0,
        gap: 0,
    },
    cameraContainer: {
        flex: 1,
        alignSelf: "stretch",
        overflow: "hidden",
    },
    camera: {
        flex: 1,
    },
});

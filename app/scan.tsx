import React, { useState, useCallback, useRef } from "react";
import { View, StyleSheet, Linking, Alert } from "react-native";
import { StyledText } from "@/components/StyledText";
import { HapticPressable } from "@/components/HapticPressable";
import {
    ExpoBarcodeScannerView,
    useCameraPermissions,
    BarcodeResult,
} from "@/modules/expo-barcode-scanner";
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
    const [facing, setFacing] = useState<"front" | "back">("back");
    const [permission, requestPermission] = useCameraPermissions();
    const lastScannedRef = useRef<string | null>(null);
    const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isCooldownRef = useRef(false);

    const handleSwapCamera = useCallback(() => {
        setFacing((current) => (current === "back" ? "front" : "back"));
    }, []);

    const handleBarcodeScanned = useCallback(
        async (event: { nativeEvent: BarcodeResult }) => {
            const data = event.nativeEvent.data;

            if (isCooldownRef.current || lastScannedRef.current === data) {
                return;
            }

            isCooldownRef.current = true;
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
                isCooldownRef.current = false;
                lastScannedRef.current = null;
            }, SCAN_COOLDOWN_MS);
        },
        []
    );

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        const textColor = invertColors ? "black" : "white";
        return (
            <ContentContainer headerTitle="Scan QR Code">
                <StyledText style={styles.messageText}>
                    We need your permission to use the camera
                </StyledText>
                <View style={styles.buttonContainer}>
                    <HapticPressable onPress={requestPermission} style={styles.button}>
                        <StyledText style={[styles.buttonText, { color: textColor }]}>
                            Grant
                        </StyledText>
                    </HapticPressable>
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
            <ExpoBarcodeScannerView
                style={styles.camera}
                facing={facing}
                onBarcodeScanned={handleBarcodeScanned}
            />
        </ContentContainer>
    );
}

const styles = StyleSheet.create({
    messageText: {
        fontSize: n(18),
        marginTop: n(10),
    },
    buttonContainer: {
        width: "100%",
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    button: {
        paddingVertical: n(15),
        paddingHorizontal: n(30),
        alignItems: "center",
        justifyContent: "flex-end",
        minWidth: n(200),
    },
    buttonText: {
        fontSize: n(40),
        textTransform: "uppercase",
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

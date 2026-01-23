import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { View, StyleSheet, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StyledText } from "@/components/StyledText";
import { usePasses } from "@/contexts/PassesContext";
import ContentContainer from "@/components/ContentContainer";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { n } from "@/utils/scaling";
import { BarcodeType } from "@/types/pass";
import {
    getBwipJsBcid,
    generateBarcode,
    buildBarcodeOptions,
    getCachedBarcode,
    setCachedBarcode,
    isValidBarcodeType,
} from "@/utils/barcodeGenerator";

export default function QRDisplayScreen() {
    const { invertColors } = useInvertColors();
    const router = useRouter();
    const params = useLocalSearchParams<{
        scannedData: string;
        scannedType?: string;
        passName?: string;
        passId?: string;
        confirmed?: string;
        action?: string;
    }>();
    const { scannedData, scannedType, passName, passId } = params;
    const { addPass, getPassById, deletePass } = usePasses();
    const [barcodeSource, setBarcodeSource] = useState<{ uri: string; width: number; height: number } | null>(null);
    const [barcodeError, setBarcodeError] = useState<string | null>(null);
    const [scaledSize, setScaledSize] = useState({ width: 0, height: 0 });
    const [viewSize, setViewSize] = useState({ width: 0, height: 0 });
    const hasAddedPassRef = useRef(false);

    const existingPass = passId ? getPassById(passId) : undefined;
    const currentData = existingPass ? existingPass.data : scannedData;
    const currentType = existingPass ? existingPass.type : scannedType || "qr";
    const currentPassName = existingPass ? existingPass.name : passName;

    useEffect(() => {
        if (barcodeSource && viewSize.width > 0 && viewSize.height > 0) {
            const availableWidth = viewSize.width * 0.8;
            const availableHeight = viewSize.height * 0.6;

            const imageWidth = barcodeSource.width;
            const imageHeight = barcodeSource.height;

            if (imageWidth > 0 && imageHeight > 0) {
                const widthScale = availableWidth / imageWidth;
                const heightScale = availableHeight / imageHeight;
                const scale = Math.min(widthScale, heightScale);

                setScaledSize({
                    width: imageWidth * scale,
                    height: imageHeight * scale,
                });
            }
        }
    }, [barcodeSource, viewSize]);

    useEffect(() => {
        let cancelled = false;

        if (currentData && currentType) {
            const cacheKey = `${currentType}:${currentData}`;
            const cached = getCachedBarcode(cacheKey);

            if (cached) {
                setBarcodeSource(cached);
                return;
            }

            const bcid = getBwipJsBcid(currentType, currentData);
            const options = buildBarcodeOptions(bcid, currentData);

            setBarcodeError(null);

            generateBarcode(bcid, options)
                .then((result) => {
                    if (!cancelled) {
                        setCachedBarcode(cacheKey, result);
                        setBarcodeSource(result);
                    }
                })
                .catch((err: Error) => {
                    if (!cancelled) {
                        console.error("bwip-js toDataURL error:", err.message || err);
                        setBarcodeError("Unable to render barcode. Please try again.");
                        setBarcodeSource(null);
                    }
                });
        } else {
            setBarcodeSource(null);
            setBarcodeError(null);
        }

        return () => {
            cancelled = true;
        };
    }, [currentData, currentType]);

    const handleSavePassAndGoHome = useCallback(() => {
        if (currentData && currentPassName && !existingPass && !hasAddedPassRef.current) {
            const validatedType: BarcodeType | undefined = isValidBarcodeType(scannedType) ? scannedType : undefined;
            if (validatedType) {
                hasAddedPassRef.current = true;
                addPass(currentPassName, currentData, validatedType);
            }
        }
        router.replace("/");
    }, [existingPass, scannedType, currentData, currentPassName, addPass, router]);

    const handleDeletePress = useCallback(() => {
        if (existingPass) {
            router.push({
                pathname: "/confirm",
                params: {
                    title: "Delete Pass",
                    message: `Are you sure you want to delete "${existingPass.name}"?`,
                    confirmText: "Delete",
                    action: "deletePass",
                    returnPath: "/add/qrDisplay",
                    returnParams: JSON.stringify({
                        passId: existingPass.id,
                        scannedData: existingPass.data,
                        passName: existingPass.name,
                    }),
                },
            });
        }
    }, [existingPass, router]);

    useEffect(() => {
        if (params.confirmed === "true" && params.action === "deletePass" && existingPass) {
            router.setParams({ confirmed: undefined, action: undefined });
            deletePass(existingPass.id);
            router.replace("/");
        }
    }, [params.confirmed, params.action, existingPass, deletePass, router]);

    const handleLayout = useCallback((event: { nativeEvent: { layout: { width: number; height: number } } }) => {
        const { width, height } = event.nativeEvent.layout;
        setViewSize({ width, height });
    }, []);

    const containerBg = useMemo(
        () => ({ backgroundColor: invertColors ? "white" : "black" }),
        [invertColors]
    );

    const imageStyle = useMemo(
        () => ({ width: scaledSize.width, height: scaledSize.height }),
        [scaledSize.width, scaledSize.height]
    );

    useEffect(() => {
        if (!currentData) {
            router.replace("/");
        }
    }, [currentData, router]);

    if (!currentData) {
        return null;
    }

    return (
        <ContentContainer
            headerTitle={currentPassName}
            rightIcon={existingPass ? "delete" : undefined}
            showRightIcon={!!existingPass}
            onRightIconPress={handleDeletePress}
            onBackPress={handleSavePassAndGoHome}
            style={styles.contentContainer}
        >
            <View style={[styles.barcodeContainer, containerBg]} onLayout={handleLayout}>
                <View style={styles.qrContainer}>
                    {barcodeSource && scaledSize.width > 0 ? (
                        <Image style={imageStyle} source={{ uri: barcodeSource.uri }} />
                    ) : barcodeError ? (
                        <StyledText style={styles.loadingText}>{barcodeError}</StyledText>
                    ) : (
                        <StyledText style={styles.loadingText}>
                            {currentData ? `Generating ${currentType.toUpperCase()} Code...` : "No data for Barcode"}
                        </StyledText>
                    )}
                </View>
            </View>
        </ContentContainer>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingHorizontal: 0,
        paddingTop: 0,
        gap: 0,
    },
    barcodeContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    qrContainer: {
        padding: n(20),
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        color: "black",
    },
});

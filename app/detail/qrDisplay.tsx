import React, { useState, useEffect, useCallback, useRef } from "react";
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
    isValidBarcodeType,
    getPersistedBarcode,
    persistBarcode,
} from "@/utils/barcodeGenerator";

export default function QRDisplayScreen() {
    const { invertColors } = useInvertColors();
    const router = useRouter();
    const params = useLocalSearchParams<{
        scannedData: string;
        scannedRawData?: string;
        scannedType?: string;
        passName?: string;
        passId?: string;
        confirmed?: string;
        action?: string;
    }>();
    const { scannedData, scannedRawData, scannedType, passName, passId } = params;
    const { addPass, getPassById, deletePass } = usePasses();
    const [barcodeSource, setBarcodeSource] = useState<{ uri: string; width: number; height: number } | null>(null);
    const [barcodeError, setBarcodeError] = useState<string | null>(null);
    const [scaledSize, setScaledSize] = useState({ width: 0, height: 0 });
    const [viewSize, setViewSize] = useState({ width: 0, height: 0 });
    const hasAddedPassRef = useRef(false);

    const existingPass = passId ? getPassById(passId) : undefined;
    const currentData = existingPass ? existingPass.data : scannedData;
    const currentRawData = existingPass?.rawData ?? scannedRawData;
    const currentType = existingPass ? existingPass.type : scannedType || "qr";
    const currentPassName = existingPass ? existingPass.name : passName;

    useEffect(() => {
        if (barcodeSource && viewSize.width > 0 && viewSize.height > 0) {
            const availableWidth = viewSize.width * 0.7;
            const availableHeight = viewSize.height * 0.7;

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

        const loadBarcode = async () => {
            if (!(currentData || currentRawData) || !currentType) {
                setBarcodeSource(null);
                setBarcodeError(null);
                return;
            }

            // Check persistent cache for saved passes
            if (passId) {
                const persisted = await getPersistedBarcode(passId);
                if (!cancelled && persisted) {
                    setBarcodeSource(persisted);
                    return;
                }
            }

            if (cancelled) return;

            const bcid = getBwipJsBcid(currentType, currentData || "");
            const options = buildBarcodeOptions(bcid, currentData || "", currentRawData);
            setBarcodeError(null);

            try {
                const result = await generateBarcode(bcid, options);
                if (!cancelled) {
                    setBarcodeSource(result);
                    if (passId) {
                        persistBarcode(passId, result);
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("bwip-js toDataURL error:", (err as Error).message || err);
                    setBarcodeError("Unable to render barcode. Please try again.");
                    setBarcodeSource(null);
                }
            }
        };

        loadBarcode();

        return () => {
            cancelled = true;
        };
    }, [currentData, currentRawData, currentType, passId]);

    const handleSavePassAndGoHome = useCallback(() => {
        if ((currentData || currentRawData) && currentPassName && !existingPass && !hasAddedPassRef.current) {
            const validatedType: BarcodeType | undefined = isValidBarcodeType(scannedType) ? scannedType : undefined;
            if (validatedType) {
                hasAddedPassRef.current = true;
                addPass(currentPassName, currentData || "", validatedType, scannedRawData);
            }
        }
        router.replace("/");
    }, [existingPass, scannedType, scannedRawData, currentData, currentRawData, currentPassName, addPass, router]);

    const handleDeletePress = useCallback(() => {
        if (existingPass) {
            router.push({
                pathname: "/confirm",
                params: {
                    title: "Delete Pass",
                    message: `Are you sure you want to delete "${existingPass.name}"?`,
                    confirmText: "Delete",
                    action: "deletePass",
                    returnPath: "/detail/qrDisplay",
                    returnParams: JSON.stringify({
                        passId: existingPass.id,
                        scannedData: existingPass.data,
                        passName: existingPass.name,
                    }),
                },
            });
        }
    }, [existingPass, router]);

    const handleRename = useCallback(() => {
        if (existingPass) {
            router.push({
                pathname: "/pass-name",
                params: {
                    mode: "rename",
                    passId: existingPass.id,
                    currentName: existingPass.name,
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

    useEffect(() => {
        if (!currentData && !currentRawData) {
            router.replace("/");
        }
    }, [currentData, currentRawData, router]);

    if (!currentData && !currentRawData) {
        return null;
    }

    return (
        <ContentContainer
            headerTitle={currentPassName}
            rightIcon={existingPass ? "delete" : undefined}
            showRightIcon={!!existingPass}
            onRightIconPress={handleDeletePress}
            onBackPress={handleSavePassAndGoHome}
            onTitlePress={existingPass ? handleRename : undefined}
            style={styles.contentContainer}
        >
            <View style={[styles.barcodeContainer, { backgroundColor: invertColors ? "white" : "black" }]} onLayout={handleLayout}>
                <View style={styles.qrContainer}>
                    {barcodeSource && scaledSize.width > 0 ? (
                        <Image style={{ width: scaledSize.width, height: scaledSize.height }} source={{ uri: barcodeSource.uri }} />
                    ) : barcodeError ? (
                        <StyledText style={styles.loadingText}>{barcodeError}</StyledText>
                    ) : (
                        <StyledText style={styles.loadingText}>
                            {currentData || currentRawData ? `Generating ${currentType.toUpperCase()} Code...` : "No data for Barcode"}
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

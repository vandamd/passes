import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { View, StyleSheet, Image, PixelRatio } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StyledText } from "@/components/StyledText";
import { usePasses } from "@/contexts/PassesContext";
import { toDataURL, type DataURL } from "@bwip-js/react-native";
import ContentContainer from "@/components/ContentContainer";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { n } from "@/utils/scaling";
import { BarcodeType } from "@/types/pass";

const BARCODE_TYPE_MAPPING: Readonly<Record<string, string>> = {
    aztec: "azteccode",
    ean13: "ean13",
    ean8: "ean8",
    qr: "qrcode",
    pdf417: "pdf417",
    upc_e: "upce",
    datamatrix: "datamatrix",
    code39: "code39",
    code93: "code93",
    itf14: "itf14",
    codabar: "rationalizedCodabar",
    code128: "code128",
    upc_a: "upca",
};

const getAztecBcid = (data: string): string => {
    const asNumber = parseInt(data, 10);
    if (!isNaN(asNumber) && asNumber >= 0 && asNumber <= 255 && String(asNumber) === data) {
        return "aztecrune";
    }
    if (data.length <= 89) {
        return "azteccodecompact";
    }
    return "azteccode";
};

const getBwipJsBcid = (expoType: string, data: string): string => {
    if (expoType.toLowerCase() === "aztec") {
        return getAztecBcid(data);
    }
    return BARCODE_TYPE_MAPPING[expoType.toLowerCase()] || expoType;
};

type BwipRenderOptions = Parameters<typeof toDataURL>[0] & {
    includestartstop?: boolean;
};

const generateBarcode = async (
    bcid: string,
    options: Omit<BwipRenderOptions, "bcid">
): Promise<DataURL> => {
    try {
        return await toDataURL({ ...options, bcid });
    } catch (err) {
        if (bcid === "azteccodecompact") {
            return await toDataURL({ ...options, bcid: "azteccode" });
        }
        throw err;
    }
};

const CODABAR_SENTINELS = new Set(["A", "B", "C", "D"]);

const ensureCodabarSentinels = (value: string) => {
    const uppercaseValue = value.toUpperCase();
    const startsWithSentinel = uppercaseValue.length > 0 && CODABAR_SENTINELS.has(uppercaseValue[0]);
    const endsWithSentinel = uppercaseValue.length > 0 && CODABAR_SENTINELS.has(uppercaseValue[uppercaseValue.length - 1]);

    let sanitizedText = uppercaseValue;
    if (!startsWithSentinel) {
        sanitizedText = `A${sanitizedText}`;
    }
    if (!endsWithSentinel) {
        sanitizedText = `${sanitizedText}A`;
    }

    return {
        sanitizedText,
        altText: uppercaseValue,
        includeStartStop: startsWithSentinel && endsWithSentinel,
    };
};

// Cache for barcode images with LRU-style eviction
const MAX_CACHE_SIZE = 50;
const barcodeCache = new Map<string, DataURL>();

export default function QRDisplayScreen() {
    const { invertColors } = useInvertColors();
    const router = useRouter();
    const { scannedData, scannedType, passName, passId } = useLocalSearchParams<{
        scannedData: string;
        scannedType?: string;
        passName?: string;
        passId?: string;
    }>();
    const { addPass, getPassById, deletePass } = usePasses();
    const [barcodeSource, setBarcodeSource] = useState<DataURL | null>(null);
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
            const cached = barcodeCache.get(cacheKey);

            if (cached) {
                setBarcodeSource(cached);
                return;
            }

            const bcidForBwipJs = getBwipJsBcid(currentType, currentData);

            const bwipJsOptions: Omit<BwipRenderOptions, "bcid"> = {
                text: currentData,
                scale: PixelRatio.get() * 2,
                includetext: true,
                textxalign: "center",
                barcolor: "000000",
                backgroundcolor: "FFFFFF",
            };

            if (bcidForBwipJs === "rationalizedCodabar") {
                const { sanitizedText, altText, includeStartStop } = ensureCodabarSentinels(currentData);
                bwipJsOptions.text = sanitizedText;
                bwipJsOptions.alttext = altText || sanitizedText;
                bwipJsOptions.includestartstop = includeStartStop;
            }

            setBarcodeError(null);

            generateBarcode(bcidForBwipJs, bwipJsOptions)
                .then((result) => {
                    if (!cancelled) {
                        if (barcodeCache.size >= MAX_CACHE_SIZE) {
                            const oldestKey = barcodeCache.keys().next().value;
                            if (oldestKey) {
                                barcodeCache.delete(oldestKey);
                            }
                        }
                        barcodeCache.set(cacheKey, result);
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
        const typeToSave = existingPass ? existingPass.type : (scannedType as BarcodeType);
        if (currentData && currentPassName && typeToSave && !existingPass && !hasAddedPassRef.current) {
            hasAddedPassRef.current = true;
            addPass(currentPassName, currentData, typeToSave);
        }
        router.replace("/");
    }, [existingPass, scannedType, currentData, currentPassName, addPass, router]);

    const handleDeletePass = useCallback(() => {
        if (existingPass) {
            deletePass(existingPass.id);
            router.replace("/");
        }
    }, [existingPass, deletePass, router]);

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
            onRightIconPress={handleDeletePass}
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

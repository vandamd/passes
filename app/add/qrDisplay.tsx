import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet, Image, PixelRatio } from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { StyledText } from "@/components/StyledText";
import { usePasses } from "@/contexts/PassesContext";
import { toDataURL, type DataURL } from "@bwip-js/react-native";
import ContentContainer from "@/components/ContentContainer";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { normalizedSize } from "@/utils/fontScaling";

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

const ONE_DIMENSIONAL_CODES = [
    "ean13",
    "ean8",
    "upce",
    "code39",
    "code93",
    "itf14",
    "rationalizedCodabar",
    "code128",
    "upca",
] as const;

const getBwipJsBcid = (expoType: string): string => {
    return BARCODE_TYPE_MAPPING[expoType.toLowerCase()] || expoType;
};

type BwipRenderOptions = Parameters<typeof toDataURL>[0] & {
    includestartstop?: boolean;
};

const CODABAR_SENTINELS = new Set(["A", "B", "C", "D"]);

const ensureCodabarSentinels = (value: string) => {
    const uppercaseValue = value.toUpperCase();

    const startsWithSentinel =
        uppercaseValue.length > 0 && CODABAR_SENTINELS.has(uppercaseValue[0]);
    const endsWithSentinel =
        uppercaseValue.length > 0 && CODABAR_SENTINELS.has(uppercaseValue[uppercaseValue.length - 1]);

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

export default function QRDisplayScreen() {
    const { invertColors } = useInvertColors();
    const router = useRouter();
    const { scannedData, scannedType, passName, passId } =
        useLocalSearchParams<{
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
    const existingPass = passId ? getPassById(passId) : undefined;
    const currentData = existingPass ? existingPass.data : scannedData;
    const currentType = existingPass
        ? existingPass.type
        : scannedType || "qrcode";
    const currentPassName = existingPass ? existingPass.name : passName;

    useEffect(() => {
        if (barcodeSource && viewSize.width > 0 && viewSize.height > 0) {
            const availableWidth = viewSize.width - viewSize.width * 0.2;
            const availableHeight = viewSize.height - viewSize.height * 0.4;

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
            const bcidForBwipJs = getBwipJsBcid(currentType);

            const bwipJsOptions: BwipRenderOptions = {
                bcid: bcidForBwipJs,
                text: currentData,
                scale: PixelRatio.get() * 2,
                includetext: true,
                textxalign: "center",
                barcolor: "000000",
                backgroundcolor: "FFFFFF",
            };

            if (bcidForBwipJs === "rationalizedCodabar") {
                const { sanitizedText, altText, includeStartStop } = ensureCodabarSentinels(
                    currentData
                );

                bwipJsOptions.text = sanitizedText;
                bwipJsOptions.alttext = altText || sanitizedText;
                bwipJsOptions.includestartstop = includeStartStop;
            }

            setBarcodeError(null);

            toDataURL(bwipJsOptions)
                .then(result => {
                    if (!cancelled) {
                        setBarcodeSource(result);
                    }
                })
                .catch((err: Error) => {
                    if (!cancelled) {
                        console.error(
                            "bwip-js toDataURL error:",
                            err.message ? err.message : err
                        );
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
        const typeToSave = existingPass ? existingPass.type : scannedType;
        if (currentData && currentPassName && typeToSave && !existingPass) {
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

    const handleRename = useCallback(() => {
        router.push({
            pathname: "/rename",
            params: {
                currentName: currentPassName,
                passId: existingPass?.id
            }
        });
    }, [router, currentPassName, existingPass?.id]);

    const containerBg = useMemo(() => ({
        backgroundColor: invertColors ? "white" : "black"
    }), [invertColors]);

    const imageStyle = useMemo(() => ({
        width: scaledSize.width,
        height: scaledSize.height,
    }), [scaledSize.width, scaledSize.height]);

    const handleLayout = useCallback((event: any) => {
        const { width, height } = event.nativeEvent.layout;
        setViewSize({ width, height });
    }, []);

    if (!currentData) {
        router.replace("/");
        return null;
    }

    return (
        <>
            <Stack.Screen />
            <ContentContainer
                headerTitle={currentPassName}
                headerIcon="delete"
                headerIconPress={handleDeletePass}
                headerIconShowLength={existingPass ? 1 : 0}
                backEvent={handleSavePassAndGoHome}
                onTitlePress={handleRename}
            >
                <View
                    style={[styles.contentContainer, containerBg]}
                    onLayout={handleLayout}
                >
                    <View style={styles.qrContainer}>
                        {barcodeSource && scaledSize.width > 0 ? (
                            <Image
                                style={imageStyle}
                                source={{ uri: barcodeSource.uri }}
                            />
                        ) : barcodeError ? (
                            <StyledText style={styles.loadingText}>
                                {barcodeError}
                            </StyledText>
                        ) : (
                            <StyledText style={styles.loadingText}>
                                {currentData
                                    ? `Generating ${currentType.toUpperCase()} Code...`
                                    : "No data for Barcode"}
                            </StyledText>
                        )}
                    </View>
                </View>
            </ContentContainer>
        </>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    qrContainer: {
        padding: normalizedSize(20),
        marginBottom: normalizedSize(20),
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        color: "black",
    },
});

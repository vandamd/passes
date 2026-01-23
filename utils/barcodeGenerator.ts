import { toDataURL, type DataURL } from "@bwip-js/react-native";
import { PixelRatio } from "react-native";
import { BarcodeType, SUPPORTED_BARCODE_TYPES } from "@/types/pass";
import { readFromCache, writeToCache, deleteFromCache, CachedBarcode } from "./barcodeFileCache";

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
    // Empty data means binary-only - use full azteccode
    if (data.length === 0) {
        return "azteccode";
    }
    const asNumber = parseInt(data, 10);
    if (!isNaN(asNumber) && asNumber >= 0 && asNumber <= 255 && String(asNumber) === data) {
        return "aztecrune";
    }
    if (data.length <= 89) {
        return "azteccodecompact";
    }
    return "azteccode";
};

export const getBwipJsBcid = (expoType: string, data: string): string => {
    if (expoType.toLowerCase() === "aztec") {
        return getAztecBcid(data);
    }
    return BARCODE_TYPE_MAPPING[expoType.toLowerCase()] || expoType;
};

type BwipRenderOptions = Parameters<typeof toDataURL>[0] & {
    includestartstop?: boolean;
    binarytext?: boolean;
};

const decodeBase64ToBinaryString = (base64: string): string | null => {
    try {
        return atob(base64);
    } catch {
        return null;
    }
};

export const generateBarcode = async (
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

export const ensureCodabarSentinels = (value: string) => {
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

export const buildBarcodeOptions = (bcid: string, data: string, rawData?: string): Omit<BwipRenderOptions, "bcid"> => {
    const decodedBinary = rawData ? decodeBase64ToBinaryString(rawData) : null;

    const options: Omit<BwipRenderOptions, "bcid"> = {
        text: decodedBinary || data,
        scale: PixelRatio.get() * 2,
        includetext: !decodedBinary,
        textxalign: "center",
        barcolor: "000000",
        backgroundcolor: "FFFFFF",
        binarytext: !!decodedBinary,
    };

    if (bcid === "rationalizedCodabar") {
        const { sanitizedText, altText, includeStartStop } = ensureCodabarSentinels(data);
        options.text = sanitizedText;
        options.alttext = altText || sanitizedText;
        options.includestartstop = includeStartStop;
    }

    return options;
};

export const isValidBarcodeType = (type: string | undefined): type is BarcodeType => {
    return type !== undefined && SUPPORTED_BARCODE_TYPES.includes(type as BarcodeType);
};

export const getPersistedBarcode = (passId: string): Promise<CachedBarcode | null> => {
    return readFromCache(passId);
};

export const persistBarcode = (passId: string, barcode: CachedBarcode): Promise<void> => {
    return writeToCache(passId, barcode);
};

export const deletePersistedBarcode = (passId: string): Promise<void> => {
    return deleteFromCache(passId);
};

export const preGenerateBarcode = async (
    passId: string,
    type: BarcodeType,
    data: string,
    rawData?: string
): Promise<void> => {
    try {
        const bcid = getBwipJsBcid(type, data);
        const options = buildBarcodeOptions(bcid, data, rawData);
        const barcode = await generateBarcode(bcid, options);
        await persistBarcode(passId, barcode);
    } catch {
        // Silent fail - barcode will be generated on demand
    }
};

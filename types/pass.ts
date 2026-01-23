export interface Pass {
    readonly id: string;
    readonly name: string;
    readonly data: string;
    readonly type: BarcodeType;
}

export type BarcodeType =
    | "aztec"
    | "ean13"
    | "ean8"
    | "qr"
    | "pdf417"
    | "upc_e"
    | "datamatrix"
    | "code39"
    | "code93"
    | "itf14"
    | "codabar"
    | "code128"
    | "upc_a";

export const SUPPORTED_BARCODE_TYPES: readonly BarcodeType[] = [
    "aztec",
    "ean13",
    "ean8",
    "qr",
    "pdf417",
    "upc_e",
    "datamatrix",
    "code39",
    "code93",
    "itf14",
    "codabar",
    "code128",
    "upc_a",
] as const;

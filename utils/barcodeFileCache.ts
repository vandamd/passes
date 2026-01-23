import AsyncStorage from "@react-native-async-storage/async-storage";

export type CachedBarcode = { uri: string; width: number; height: number };

const getCacheKey = (passId: string) => `barcode_${passId}`;

export const readFromCache = async (passId: string): Promise<CachedBarcode | null> => {
    try {
        const cached = await AsyncStorage.getItem(getCacheKey(passId));
        return cached ? JSON.parse(cached) : null;
    } catch {
        return null;
    }
};

export const writeToCache = async (passId: string, barcode: CachedBarcode): Promise<void> => {
    try {
        await AsyncStorage.setItem(getCacheKey(passId), JSON.stringify(barcode));
    } catch {
        // Silent fail
    }
};

export const deleteFromCache = async (passId: string): Promise<void> => {
    try {
        await AsyncStorage.removeItem(getCacheKey(passId));
    } catch {
        // Silent fail
    }
};

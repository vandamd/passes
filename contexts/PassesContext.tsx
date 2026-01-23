import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { Pass, BarcodeType, SUPPORTED_BARCODE_TYPES } from "@/types/pass";

const parseStoredPasses = (stored: string): Pass[] => {
    try {
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.filter(
            (entry): entry is Pass =>
                typeof entry === "object" &&
                entry !== null &&
                typeof entry.id === "string" &&
                typeof entry.name === "string" &&
                typeof entry.data === "string" &&
                (entry.rawData === undefined || typeof entry.rawData === "string") &&
                typeof entry.type === "string" &&
                SUPPORTED_BARCODE_TYPES.includes(entry.type as BarcodeType)
        );
    } catch {
        return [];
    }
};

interface PassesContextType {
    passes: Pass[];
    addPass: (name: string, data: string, type: BarcodeType, rawData?: string) => void;
    deletePass: (id: string) => void;
    updatePassName: (id: string, newName: string) => void;
    getPassById: (id: string) => Pass | undefined;
    reorderPass: (id: string, direction: "up" | "down") => void;
}

const PASSES_STORAGE_KEY = "userPasses_v1";

const PassesContext = createContext<PassesContextType | undefined>(undefined);

export const PassesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [passes, setPasses] = useState<Pass[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        let cancelled = false;

        SecureStore.getItemAsync(PASSES_STORAGE_KEY)
            .then((stored) => {
                if (cancelled) return;
                if (stored) {
                    setPasses(parseStoredPasses(stored));
                }
                setIsHydrated(true);
            })
            .catch(() => {
                if (!cancelled) setIsHydrated(true);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!isHydrated) return;

        const timeoutId = setTimeout(() => {
            SecureStore.setItemAsync(PASSES_STORAGE_KEY, JSON.stringify(passes));
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [passes, isHydrated]);

    const addPass = useCallback((name: string, data: string, type: BarcodeType, rawData?: string) => {
        const newPass: Pass = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            name,
            data,
            ...(rawData !== undefined && rawData !== "" && { rawData }),
            type,
        };
        setPasses((prev) => [...prev, newPass]);
    }, []);

    const deletePass = useCallback((id: string) => {
        setPasses((prev) => prev.filter((pass) => pass.id !== id));
    }, []);

    const updatePassName = useCallback((id: string, newName: string) => {
        setPasses((prev) =>
            prev.map((pass) => (pass.id === id ? { ...pass, name: newName } : pass))
        );
    }, []);

    const getPassById = useCallback(
        (id: string) => {
            return passes.find((pass) => pass.id === id);
        },
        [passes]
    );

    const reorderPass = useCallback((id: string, direction: "up" | "down") => {
        setPasses((prev) => {
            const index = prev.findIndex((pass) => pass.id === id);
            if (index === -1) return prev;

            const newIndex = direction === "up" ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= prev.length) return prev;

            const newPasses = [...prev];
            [newPasses[index], newPasses[newIndex]] = [newPasses[newIndex], newPasses[index]];
            return newPasses;
        });
    }, []);

    const contextValue = useMemo(
        () => ({ passes, addPass, deletePass, updatePassName, getPassById, reorderPass }),
        [passes, addPass, deletePass, updatePassName, getPassById, reorderPass]
    );

    return (
        <PassesContext.Provider value={contextValue}>
            {children}
        </PassesContext.Provider>
    );
};

export const usePasses = () => {
    const context = useContext(PassesContext);
    if (context === undefined) {
        throw new Error("usePasses must be used within a PassesProvider");
    }
    return context;
};

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
                typeof entry.type === "string" &&
                SUPPORTED_BARCODE_TYPES.includes(entry.type as BarcodeType)
        );
    } catch {
        return [];
    }
};

interface PassesContextType {
    passes: Pass[];
    addPass: (name: string, data: string, type: BarcodeType) => void;
    deletePass: (id: string) => void;
    updatePassName: (id: string, newName: string) => void;
    getPassById: (id: string) => Pass | undefined;
}

const PASSES_STORAGE_KEY = "passes";

const PassesContext = createContext<PassesContextType | undefined>(undefined);

export const PassesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [passes, setPasses] = useState<Pass[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load passes from SecureStore on mount
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

    // Save passes to SecureStore when they change (after hydration)
    useEffect(() => {
        if (!isHydrated) return;

        const timeoutId = setTimeout(() => {
            SecureStore.setItemAsync(PASSES_STORAGE_KEY, JSON.stringify(passes));
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [passes, isHydrated]);

    const addPass = useCallback((name: string, data: string, type: BarcodeType) => {
        const newPass: Pass = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            data,
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

    const contextValue = useMemo(
        () => ({ passes, addPass, deletePass, updatePassName, getPassById }),
        [passes, addPass, deletePass, updatePassName, getPassById]
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

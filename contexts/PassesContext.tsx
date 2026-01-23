import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { Pass, BarcodeType } from "@/types/pass";

interface PassesContextType {
    passes: Pass[];
    addPass: (name: string, data: string, type: string) => void;
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
                    setPasses(JSON.parse(stored));
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

    const addPass = (name: string, data: string, type: string) => {
        const newPass: Pass = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            data,
            type: type as BarcodeType,
        };
        setPasses((prev) => [...prev, newPass]);
    };

    const deletePass = (id: string) => {
        setPasses((prev) => prev.filter((pass) => pass.id !== id));
    };

    const updatePassName = (id: string, newName: string) => {
        setPasses((prev) =>
            prev.map((pass) => (pass.id === id ? { ...pass, name: newName } : pass))
        );
    };

    const getPassById = (id: string) => {
        return passes.find((pass) => pass.id === id);
    };

    return (
        <PassesContext.Provider value={{ passes, addPass, deletePass, updatePassName, getPassById }}>
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

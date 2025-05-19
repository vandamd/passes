import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export interface Pass {
  id: string;
  name: string;
  data: string;
  type: string;
}

interface PassesContextType {
  passes: Pass[];
  addPass: (name: string, data: string, type: string) => void;
  getPassById: (id: string) => Pass | undefined;
  deletePass: (id: string) => void;
}

const PASSES_STORAGE_KEY = 'userPasses_v1'; // Added a version for potential future migrations

const PassesContext = createContext<PassesContextType | undefined>(undefined);

export const PassesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPasses = async () => {
      setIsLoading(true);
      try {
        const storedPassesString = await SecureStore.getItemAsync(PASSES_STORAGE_KEY);
        if (storedPassesString) {
          setPasses(JSON.parse(storedPassesString));
        }
      } catch (error) {
        console.error("Failed to load passes from secure store:", error);
        // Optionally, inform the user about the error
      } finally {
        setIsLoading(false);
      }
    };

    loadPasses();
  }, []);

  useEffect(() => {
    const savePasses = async () => {
      if (!isLoading) { // Only save if not in initial loading phase
        try {
          await SecureStore.setItemAsync(PASSES_STORAGE_KEY, JSON.stringify(passes));
        } catch (error) {
          console.error("Failed to save passes to secure store:", error);
          // Optionally, inform the user about the error
        }
      }
    };

    savePasses();
  }, [passes, isLoading]);

  const addPass = (name: string, data: string, type: string) => {
    const newPass: Pass = {
      id: Date.now().toString(), // Simple unique ID
      name,
      data,
      type,
    };
    setPasses(prevPasses => [...prevPasses, newPass]);
  };

  const getPassById = (id: string): Pass | undefined => {
    return passes.find(pass => pass.id === id);
  };

  const deletePass = (id: string) => {
    setPasses(prevPasses => prevPasses.filter(pass => pass.id !== id));
  };

  return (
    <PassesContext.Provider value={{ passes, addPass, getPassById, deletePass }}>
      {children}
    </PassesContext.Provider>
  );
};

export const usePasses = () => {
  const context = useContext(PassesContext);
  if (context === undefined) {
    throw new Error('usePasses must be used within a PassesProvider');
  }
  return context;
};
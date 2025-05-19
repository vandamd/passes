import React, { useState, useEffect } from "react";
import { View, Pressable, StyleSheet, Text, Platform, Image, PixelRatio, ScrollView } from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { StyledText } from "../../components/StyledText";
import { MaterialIcons } from "@expo/vector-icons";
import { toDataURL, type DataURL } from '@bwip-js/react-native';
import { usePasses } from "../../contexts/PassesContext";

// Helper function to map expo-camera types to bwip-js bcids
const getBwipJsBcid = (expoType: string): string => {
  const mapping: { [key: string]: string } = {
    'aztec': 'azteccode',
    'ean13': 'ean13',
    'ean8': 'ean8',
    'qr': 'qrcode',
    'pdf417': 'pdf417',
    'upc_e': 'upce',
    'datamatrix': 'datamatrix',
    'code39': 'code39',
    'code93': 'code93',
    'itf14': 'itf14',
    'codabar': 'rationalizedCodabar',
    'code128': 'code128',
    'upc_a': 'upca',
  };
  return mapping[expoType.toLowerCase()] || expoType;
};

interface BwipJsCallbackError {
  message: string;
}

interface PngBuffer {
  toString(encoding: 'base64'): string;
}

export default function QRDisplayScreen() {
  const router = useRouter();
  const { scannedData, scannedType, passName, passId } = useLocalSearchParams<{ scannedData: string; scannedType?: string; passName?: string; passId?: string }>();
  const { addPass, getPassById, deletePass } = usePasses();

  const [barcodeSource, setBarcodeSource] = useState<DataURL | null>(null);

  const existingPass = passId ? getPassById(passId) : undefined;

  const currentData = existingPass ? existingPass.data : scannedData;
  const currentType = existingPass ? existingPass.type : scannedType || 'qrcode';
  const currentPassName = existingPass ? existingPass.name : passName;

  useEffect(() => {
    if (currentData && currentType) {
      // console.log("Raw Scanned Data (from qrDisplay.tsx):", currentData);

      const bcidForBwipJs = getBwipJsBcid(currentType);

      const oneDimensionalCodes = [
        'ean13', 'ean8', 'upce', 'code39', 'code93',
        'itf14', 'rationalizedCodabar', 'code128', 'upca'
      ];

      const is1D = oneDimensionalCodes.includes(bcidForBwipJs);

      const bwipJsOptions = {
        bcid: bcidForBwipJs,
        text: currentData,
        scale: PixelRatio.get(),
        // width: is1D ? 50 : 50, // Wider for 1D codes
        // height: is1D ? 15 : 50, // Shorter for 1D codes
        includetext: true,
        textxalign: 'center' as 'center',
        barcolor: '000000',
        backgroundcolor: 'FFFFFF',
      };

      toDataURL(bwipJsOptions)
      .then(setBarcodeSource)
      .catch((err: Error) => {
        console.error("bwip-js toDataURL error:", err.message ? err.message : err);
        setBarcodeSource(null);
      });

    } else {
      setBarcodeSource(null);
    }
  }, [currentData, currentType]);

  if (!currentData) {
    router.replace("/");
    return null;
  }

  const handleSavePassAndGoHome = () => {
    const typeToSave = existingPass ? existingPass.type : scannedType;
    if (currentData && currentPassName && typeToSave && !existingPass) {
      addPass(currentPassName, currentData, typeToSave);
    }
    router.replace("/");
  };
``
  const handleDeletePass = () => {
    if (existingPass) {
      deletePass(existingPass.id);
      router.replace("/");
    }
  };

  return (
    <>
      <Stack.Screen />
      <View style={styles.header}>
        <Pressable onPress={handleSavePassAndGoHome}>
          <MaterialIcons name="arrow-back-ios" size={24} color="white" />
        </Pressable>
        <StyledText
          style={styles.headerTitle}
          numberOfLines={1}
        >
          {currentPassName || `Scanned ${currentType.toUpperCase()} Code`}
        </StyledText>
        {existingPass ? (
          <Pressable onPress={handleDeletePass}>
            <MaterialIcons name="delete" size={28} color="white" />
          </Pressable>
        ) : (
          <View style={{ width: 28 }} />
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.qrContainer}>
        {barcodeSource ? (
          <Image
            style={{ width: barcodeSource.width, height: barcodeSource.height }}
            source={{ uri: barcodeSource.uri }}
          />
        ) : (
          <StyledText style={{color: 'white'}}>{currentData ? `Generating ${currentType.toUpperCase()} Code...` : "No data for Barcode"}</StyledText>
        )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "black",
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontFamily: "AkkuratLL-Regular",
    maxWidth: "70%",
    textAlign: "left",
    overflow: "hidden",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: "center",
    justifyContent: 'center',
    width: '100%',
  },
  qrContainer: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decodedInfoContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#2C2C2E', // Darker grey
    borderRadius: 8,
    width: '95%',
  },
  decodedHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0', // Lighter grey for header text
    marginBottom: 12,
  },
  decodedSubHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CFCFCF',
    marginTop: 8,
    marginBottom: 6,
  },
  decodedText: {
    fontSize: 14,
    color: '#B0B0B0', // Medium grey for text
    marginBottom: 6,
  },
   decodedTextSmall: {
    fontSize: 11,
    color: '#888888', // Lighter grey for less important debug info
    marginBottom: 3,
  },
  decodedTextError: {
    fontSize: 14,
    color: '#FF6B6B', // Softer red for errors
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nestedDetailsContainer: {
    marginTop: 5,
    marginLeft: 10,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderColor: '#444444',
  },
  saveButtonContainer: {
    marginTop: 20,
    width: '60%',
    backgroundColor: Platform.OS === 'android' ? 'white' : undefined,
    borderRadius: 5,
  }
});
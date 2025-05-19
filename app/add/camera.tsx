import React, { useState } from "react";
import { View, Pressable, StyleSheet, Text, Button, TouchableOpacity } from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { StyledText } from "../../components/StyledText";
import { MaterialIcons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';

export default function CameraScreen() {
  const router = useRouter();
  const { passName } = useLocalSearchParams<{ passName?: string }>();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  const handleSwapCamera = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleBarcodeScanned = (scanningResult: BarcodeScanningResult) => {
    const data = scanningResult.data;
    const type = scanningResult.type;
    router.push({
      pathname: "/add/qrDisplay",
      params: { scannedData: data, scannedType: type, passName: passName || "" }
    });
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <StyledText style={{ textAlign: 'center', color: 'white', marginBottom: 10 }}>We need your permission to show the camera</StyledText>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen />
        <View style={styles.header}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/")}>
            <MaterialIcons name="arrow-back-ios" size={28} color="white" />
          </Pressable>
          <Pressable onPress={handleSwapCamera}>
            <MaterialIcons name="flip-camera-ios" size={28} color="white" />
          </Pressable>
        </View>

        <View style={styles.container}>
          <CameraView
            style={styles.camera}
            facing={facing as CameraType}
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["aztec", "ean13", "ean8", "qr", "pdf417", "upc_e", "datamatrix", "code39", "code93", "itf14", "codabar", "code128", "upc_a"],
            }}
          />
        </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 21,
    paddingVertical: 10,
    backgroundColor: "black",
    zIndex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: '100%',
  },
});
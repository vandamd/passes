import React, { useState } from "react";
import { View, StyleSheet, Button, Linking, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { StyledText } from "@/components/StyledText";
import {
	CameraType,
	CameraView,
	useCameraPermissions,
	BarcodeScanningResult,
} from "expo-camera";
import ContentContainer from "@/components/ContentContainer";

export default function ScanScreen() {
	const router = useRouter();
	const [facing, setFacing] = useState<CameraType>("back");
	const [permission, requestPermission] = useCameraPermissions();

	const handleSwapCamera = () => {
		setFacing((current) => (current === "back" ? "front" : "back"));
	};

	const handleBarcodeScanned = async (scanningResult: BarcodeScanningResult) => {
		const data = scanningResult.data;

		// Check if the scanned data is a URL
		if (data.startsWith("http://") || data.startsWith("https://")) {
			try {
				const supported = await Linking.canOpenURL(data);
				if (supported) {
					await Linking.openURL(data);
				} else {
					Alert.alert("Error", "Cannot open this URL");
				}
			} catch (error) {
				Alert.alert("Error", "Failed to open URL");
			}
		} else {
			Alert.alert("Not a URL", `Scanned: ${data}`);
		}
	};

	if (!permission) {
		return <View />;
	}

	if (!permission.granted) {
		return (
			<View style={styles.container}>
				<StyledText
					style={{
						textAlign: "center",
						color: "white",
						marginBottom: 10,
					}}
				>
					We need your permission to show the camera
				</StyledText>
				<Button onPress={requestPermission} title="Grant Permission" />
			</View>
		);
	}

	return (
		<>
			<Stack.Screen />
			<ContentContainer
				headerTitle="Scan QR Code"
				headerIcon="flip-camera-ios"
				headerIconPress={handleSwapCamera}
				style={{ paddingHorizontal: 0 }}
			>
				<CameraView
					style={{ height: "100%", width: "100%" }}
					facing={facing as CameraType}
					onBarcodeScanned={handleBarcodeScanned}
					barcodeScannerSettings={{
						barcodeTypes: ["qr"],
					}}
				/>
			</ContentContainer>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "black",
	},
});

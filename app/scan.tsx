import React, { useState, useCallback, useRef } from "react";
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
	const [isScanning, setIsScanning] = useState(true);
	const lastScannedRef = useRef<string | null>(null);
	const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const handleSwapCamera = useCallback(() => {
		setFacing((current) => (current === "back" ? "front" : "back"));
	}, []);

	const handleBarcodeScanned = useCallback(async (scanningResult: BarcodeScanningResult) => {
		const data = scanningResult.data;

		// Prevent duplicate scans
		if (!isScanning || lastScannedRef.current === data) {
			return;
		}

		setIsScanning(false);
		lastScannedRef.current = data;

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

		// Re-enable scanning after 2 seconds
		if (scanTimeoutRef.current) {
			clearTimeout(scanTimeoutRef.current);
		}
		scanTimeoutRef.current = setTimeout(() => {
			setIsScanning(true);
			lastScannedRef.current = null;
		}, 2000);
	}, [isScanning]);

	if (!permission) {
		return <View />;
	}

	if (!permission.granted) {
		return (
			<View style={styles.container}>
				<StyledText style={styles.permissionText}>
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
				style={styles.contentContainer}
			>
				<CameraView
					style={styles.camera}
					facing={facing as CameraType}
					onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
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
	permissionText: {
		textAlign: "center",
		color: "white",
		marginBottom: 10,
	},
	contentContainer: {
		paddingHorizontal: 0,
	},
	camera: {
		height: "100%",
		width: "100%",
	},
});

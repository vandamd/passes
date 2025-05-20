import React, { useState } from "react";
import { View, StyleSheet, Button } from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { StyledText } from "../../components/StyledText";
import {
	CameraType,
	CameraView,
	useCameraPermissions,
	BarcodeScanningResult,
} from "expo-camera";
import { Header } from "@/components/Header";

export default function CameraScreen() {
	const router = useRouter();
	const { passName } = useLocalSearchParams<{ passName?: string }>();
	const [facing, setFacing] = useState<CameraType>("back");
	const [permission, requestPermission] = useCameraPermissions();

	const handleSwapCamera = () => {
		setFacing((current) => (current === "back" ? "front" : "back"));
	};

	const handleBarcodeScanned = (scanningResult: BarcodeScanningResult) => {
		const data = scanningResult.data;
		const type = scanningResult.type;
		router.push({
			pathname: "/add/qrDisplay",
			params: {
				scannedData: data,
				scannedType: type,
				passName: passName || "",
			},
		});
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
			<Header iconName="flip-camera-ios" onIconPress={handleSwapCamera} />

			<View style={styles.container}>
				<CameraView
					style={{ flex: 1 }}
					facing={facing as CameraType}
					onBarcodeScanned={handleBarcodeScanned}
					barcodeScannerSettings={{
						barcodeTypes: [
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
						],
					}}
				/>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "black",
	},
});

import React, { useState, useEffect } from "react";
import { View, StyleSheet, Platform, Image, PixelRatio } from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { StyledText } from "../../components/StyledText";
import { toDataURL, type DataURL } from "@bwip-js/react-native";
import { usePasses } from "../../contexts/PassesContext";
import { Header } from "@/components/Header";

const getBwipJsBcid = (expoType: string): string => {
	const mapping: { [key: string]: string } = {
		aztec: "azteccode",
		ean13: "ean13",
		ean8: "ean8",
		qr: "qrcode",
		pdf417: "pdf417",
		upc_e: "upce",
		datamatrix: "datamatrix",
		code39: "code39",
		code93: "code93",
		itf14: "itf14",
		codabar: "rationalizedCodabar",
		code128: "code128",
		upc_a: "upca",
	};
	return mapping[expoType.toLowerCase()] || expoType;
};

export default function QRDisplayScreen() {
	const router = useRouter();
	const { scannedData, scannedType, passName, passId } =
		useLocalSearchParams<{
			scannedData: string;
			scannedType?: string;
			passName?: string;
			passId?: string;
		}>();
	const { addPass, getPassById, deletePass } = usePasses();
	const [barcodeSource, setBarcodeSource] = useState<DataURL | null>(null);
	const existingPass = passId ? getPassById(passId) : undefined;
	const currentData = existingPass ? existingPass.data : scannedData;
	const currentType = existingPass
		? existingPass.type
		: scannedType || "qrcode";
	const currentPassName = existingPass ? existingPass.name : passName;

	useEffect(() => {
		if (currentData && currentType) {
			const bcidForBwipJs = getBwipJsBcid(currentType);

			const oneDimensionalCodes = [
				"ean13",
				"ean8",
				"upce",
				"code39",
				"code93",
				"itf14",
				"rationalizedCodabar",
				"code128",
				"upca",
			];

			const bwipJsOptions = {
				bcid: bcidForBwipJs,
				text: currentData,
				scale: PixelRatio.get(),
				includetext: true,
				textxalign: "center" as "center",
				barcolor: "000000",
				backgroundcolor: "FFFFFF",
			};

			toDataURL(bwipJsOptions)
				.then(setBarcodeSource)
				.catch((err: Error) => {
					console.error(
						"bwip-js toDataURL error:",
						err.message ? err.message : err
					);
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
	``;

	const handleDeletePass = () => {
		if (existingPass) {
			deletePass(existingPass.id);
			router.replace("/");
		}
	};

	return (
		<>
			<Stack.Screen />
			<Header
				iconName="delete"
				onIconPress={handleDeletePass}
				iconShowLength={existingPass ? 1 : 0}
				headerTitle={currentPassName}
				backEvent={handleSavePassAndGoHome}
			/>

			<View style={styles.contentContainer}>
				<View style={styles.qrContainer}>
					{barcodeSource ? (
						<Image
							style={{
								width: barcodeSource.width,
								height: barcodeSource.height,
							}}
							source={{ uri: barcodeSource.uri }}
						/>
					) : (
						<StyledText style={{ color: "white" }}>
							{currentData
								? `Generating ${currentType.toUpperCase()} Code...`
								: "No data for Barcode"}
						</StyledText>
					)}
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	contentContainer: {
		flex: 1,
		backgroundColor: "black",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
	},
	qrContainer: {
		padding: 20,
		marginBottom: 20,
		backgroundColor: "white",
		alignItems: "center",
		justifyContent: "center",
	},
});

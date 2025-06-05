import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { HapticProvider } from "../contexts/HapticContext";
import {
	InvertColorsProvider,
	useInvertColors,
} from "@/contexts/InvertColorsContext";
import { useFonts } from "expo-font";
import { setStatusBarHidden } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PassesProvider } from "@/contexts/PassesContext";

function RootNavigation() {
	useFonts({
		"PublicSans-Regular": require("../assets/fonts/PublicSans-Regular.ttf"),
	});

	useEffect(() => {
		setStatusBarHidden(true, "none");
	}, []);

	const { invertColors } = useInvertColors();

	useEffect(() => {
		const newColor = invertColors ? "#FFFFFF" : "#000000";
		SystemUI.setBackgroundColorAsync(newColor);
	}, [invertColors]);

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: "none",
			}}
		></Stack>
	);
}

export default function RootLayout() {
	return (
		<SafeAreaProvider>
			<HapticProvider>
				<InvertColorsProvider>
					<PassesProvider>
						<RootNavigation />
					</PassesProvider>
				</InvertColorsProvider>
			</HapticProvider>
		</SafeAreaProvider>
	);
}

import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StyledText } from "./StyledText";
import { HapticPressable } from "./HapticPressable";

interface HeaderProps {
	iconName?: keyof typeof MaterialIcons.glyphMap;
	onIconPress?: () => void;
	iconShowLength?: number;
	headerTitle?: string;
	backEvent?: () => void;
}

export function Header({
	iconName,
	onIconPress,
	iconShowLength = 1,
	headerTitle,
	backEvent,
}: HeaderProps) {
	const handleBack = backEvent
		? backEvent
		: () => {
				if (router.canGoBack()) {
					router.back();
				} else {
					router.replace("/");
				}
		  };

	return (
		<View style={styles.header}>
			<HapticPressable onPress={handleBack}>
				<MaterialIcons name="arrow-back-ios" size={28} color="white" />
			</HapticPressable>
			<StyledText style={styles.title}>{headerTitle}</StyledText>
			{iconShowLength > 0 && iconName ? (
				<HapticPressable onPress={onIconPress}>
					<MaterialIcons name={iconName} size={28} color="white" />
				</HapticPressable>
			) : (
				<View style={{ width: 32 }} />
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 22,
		paddingVertical: 10,
		backgroundColor: "black",
		zIndex: 1,
	},
	title: {
		color: "white",
		fontSize: 20,
		fontFamily: "PublicSans-Regular",
		paddingBottom: 5,
	},
});

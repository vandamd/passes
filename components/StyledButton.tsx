import React from "react";
import { StyleSheet } from "react-native";
import { StyledText } from "./StyledText";
import { HapticPressable } from "./HapticPressable";

interface ButtonProps {
	text: string;
	onPress?: () => void;
	fontSize?: number;
	underline?: boolean;
}

export function StyledButton({
	text,
	onPress,
	fontSize = 30,
	underline = false,
}: ButtonProps) {
	return (
		<HapticPressable style={styles.button} onPress={onPress}>
			<StyledText
				style={[
					styles.buttonText,
					{ fontSize: fontSize },
					underline && styles.underline,
				]}
				numberOfLines={1}
			>
				{text}
			</StyledText>
		</HapticPressable>
	);
}

const styles = StyleSheet.create({
	button: {
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "flex-start",
	},
	buttonText: {
		fontSize: 30,
	},
	underline: {
		textDecorationLine: "underline",
	},
});

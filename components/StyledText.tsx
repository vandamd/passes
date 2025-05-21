import React from "react";
import { Text as DefaultText, TextProps, StyleSheet } from "react-native";

interface StyledTextProps extends TextProps {
	children: React.ReactNode;
}

export function StyledText({ style, ...rest }: StyledTextProps) {
	return <DefaultText style={[styles.text, style]} {...rest} />;
}

const styles = StyleSheet.create({
	text: {
		fontFamily: "PublicSans-Regular",
		color: "white",
	},
});

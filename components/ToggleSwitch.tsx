import React from "react";
import { View, StyleSheet } from "react-native";
import { StyledText } from "./StyledText";
import { HapticPressable } from "./HapticPressable";
import { useInvertColors } from "@/contexts/InvertColorsContext";

interface ToggleSwitchGraphicProps {
	value: boolean;
	disabled?: boolean;
	color?: string;
}

const CIRCLE_DIAMETER = 9.8;
const CIRCLE_BORDER = 2.5;
const LINE_WIDTH = 14.5;
const LINE_HEIGHT = 2.22;

const ToggleSwitchGraphic = ({ value, color }: ToggleSwitchGraphicProps) => {
	const { invertColors } = useInvertColors();
	const switchColor = invertColors ? "black" : "white";

	const graphicStyles = StyleSheet.create({
		container: {
			flexDirection: "row",
			alignItems: "center",
		},
		circle: {
			width: CIRCLE_DIAMETER,
			height: CIRCLE_DIAMETER,
			borderRadius: CIRCLE_DIAMETER / 2,
			backgroundColor: switchColor,
		},
		hollowCircle: {
			width: CIRCLE_DIAMETER,
			height: CIRCLE_DIAMETER,
			borderRadius: CIRCLE_DIAMETER / 2,
			borderWidth: CIRCLE_BORDER,
			borderColor: switchColor,
		},
		line: {
			width: LINE_WIDTH,
			height: LINE_HEIGHT,
			backgroundColor: switchColor,
		},
	});

	return (
		<View style={graphicStyles.container}>
			{!value ? (
				<>
					<View style={graphicStyles.hollowCircle} />
					<View style={graphicStyles.line} />
				</>
			) : (
				<>
					<View style={graphicStyles.line} />
					<View style={graphicStyles.circle} />
				</>
			)}
		</View>
	);
};

interface ToggleSwitchProps {
	label: string;
	value: boolean;
	onValueChange: (value: boolean) => void;
	color?: string;
}

export function ToggleSwitch({
	label,
	value,
	onValueChange,
	color = "white",
}: ToggleSwitchProps) {
	return (
		<HapticPressable
			onPress={() => {
				onValueChange(!value);
			}}
			style={[styles.container]}
		>
			<View style={styles.switchTouchable}>
				<ToggleSwitchGraphic value={value} color={color} />
			</View>
			<View style={styles.textTouchable}>
				<StyledText style={[styles.label]}>{label}</StyledText>
			</View>
		</HapticPressable>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		paddingTop: 9,
	},
	switchTouchable: {
		marginTop: 12,
		marginRight: 20,
		marginLeft: 8.5,
	},
	textTouchable: {
		flex: 1,
	},
	label: {
		fontSize: 30,
	},
});

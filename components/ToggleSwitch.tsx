import React, { useMemo, useCallback } from "react";
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

const graphicBaseStyles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
	},
	circleBase: {
		width: CIRCLE_DIAMETER,
		height: CIRCLE_DIAMETER,
		borderRadius: CIRCLE_DIAMETER / 2,
	},
	hollowCircleBase: {
		width: CIRCLE_DIAMETER,
		height: CIRCLE_DIAMETER,
		borderRadius: CIRCLE_DIAMETER / 2,
		borderWidth: CIRCLE_BORDER,
	},
	lineBase: {
		width: LINE_WIDTH,
		height: LINE_HEIGHT,
	},
});

const ToggleSwitchGraphic = React.memo(({ value }: ToggleSwitchGraphicProps) => {
	const { invertColors } = useInvertColors();

	const switchColor = invertColors ? "black" : "white";

	const circleStyle = useMemo(() => ({
		backgroundColor: switchColor
	}), [switchColor]);

	const borderStyle = useMemo(() => ({
		borderColor: switchColor
	}), [switchColor]);

	return (
		<View style={graphicBaseStyles.container}>
			{!value ? (
				<>
					<View style={[graphicBaseStyles.hollowCircleBase, borderStyle]} />
					<View style={[graphicBaseStyles.lineBase, circleStyle]} />
				</>
			) : (
				<>
					<View style={[graphicBaseStyles.lineBase, circleStyle]} />
					<View style={[graphicBaseStyles.circleBase, circleStyle]} />
				</>
			)}
		</View>
	);
});

interface ToggleSwitchProps {
	label: string;
	value: boolean;
	onValueChange: (value: boolean) => void;
	color?: string;
}

export const ToggleSwitch = React.memo(({
	label,
	value,
	onValueChange,
	color = "white",
}: ToggleSwitchProps) => {
	const handleToggle = useCallback(() => {
		onValueChange(!value);
	}, [value, onValueChange]);

	return (
		<HapticPressable
			onPress={handleToggle}
			style={styles.container}
		>
			<View style={styles.switchTouchable}>
				<ToggleSwitchGraphic value={value} color={color} />
			</View>
			<View style={styles.textTouchable}>
				<StyledText style={styles.label}>{label}</StyledText>
			</View>
		</HapticPressable>
	);
});

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

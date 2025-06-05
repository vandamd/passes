import React, { useState, useCallback } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { MaterialIcons } from "@expo/vector-icons";
import { HapticPressable } from "@/components/HapticPressable";
import * as Haptics from "expo-haptics";

export default function NamePassScreen() {
	const { invertColors } = useInvertColors();
	const [passName, setPassName] = useState("");
	const router = useRouter();

	useFocusEffect(
		useCallback(() => {
			setPassName("");
		}, [])
	);

	const handleNext = () => {
		router.push({ pathname: "/add/camera", params: { passName } });
	};

	return (
		<>
			<Stack.Screen />
			<ContentContainer
				headerTitle="Name Pass"
				headerIcon="check"
				headerIconPress={handleNext}
				headerIconShowLength={passName.length}
				style={{ gap: 32 }}
			>
				<View
					style={[
						styles.inputContainer,
						{ borderBottomColor: invertColors ? "black" : "white" },
					]}
				>
					<TextInput
						style={[
							styles.input,
							{ color: invertColors ? "black" : "white" },
						]}
						placeholderTextColor="#888"
						value={passName}
						placeholder="Pass Name"
						onChangeText={setPassName}
						autoFocus={true}
						cursorColor={invertColors ? "black" : "white"}
						selectionColor={invertColors ? "black" : "white"}
						onSubmitEditing={handleNext}
					/>
					{passName.length > 0 && (
						<HapticPressable
							style={styles.clearButton}
							onPress={() => {
								setPassName("");
								Haptics.impactAsync(
									Haptics.ImpactFeedbackStyle.Medium
								);
							}}
						>
							<MaterialIcons
								name="clear"
								size={24}
								color={invertColors ? "black" : "white"}
							/>
						</HapticPressable>
					)}
				</View>
			</ContentContainer>
		</>
	);
}

const styles = StyleSheet.create({
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		width: "100%",
		borderBottomWidth: 1,
	},
	input: {
		flex: 1,
		fontSize: 24,
		fontFamily: "PublicSans-Regular",
		paddingVertical: 2,
		textAlign: "left",
		paddingBottom: 6,
	},
	clearButton: {
		padding: 5,
	},
});

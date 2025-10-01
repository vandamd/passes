import React, { useState, useCallback, useMemo } from "react";
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

	const handleNext = useCallback(() => {
		router.push({ pathname: "/add/camera", params: { passName } });
	}, [router, passName]);

	const handleClear = useCallback(() => {
		setPassName("");
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
	}, []);

	const dynamicStyles = useMemo(() => ({
		container: { gap: 32 },
		inputContainerBorder: { borderBottomColor: invertColors ? "black" : "white" },
		inputText: { color: invertColors ? "black" : "white" },
	}), [invertColors]);

	const cursorColor = invertColors ? "black" : "white";
	const iconColor = invertColors ? "black" : "white";

	return (
		<>
			<Stack.Screen />
			<ContentContainer
				headerTitle="Name Pass"
				headerIcon="check"
				headerIconPress={handleNext}
				headerIconShowLength={passName.length}
				style={dynamicStyles.container}
			>
				<View style={[styles.inputContainer, dynamicStyles.inputContainerBorder]}>
					<TextInput
						style={[styles.input, dynamicStyles.inputText]}
						placeholderTextColor="#888"
						value={passName}
						placeholder="Pass Name"
						onChangeText={setPassName}
						autoFocus={true}
						cursorColor={cursorColor}
						selectionColor={cursorColor}
						onSubmitEditing={handleNext}
					/>
					{passName.length > 0 && (
						<HapticPressable
							style={styles.clearButton}
							onPress={handleClear}
						>
							<MaterialIcons
								name="clear"
								size={24}
								color={iconColor}
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

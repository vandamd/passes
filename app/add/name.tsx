import React, { useState, useCallback } from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import { Header } from "@/components/Header";

export default function NamePassScreen() {
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
			<View style={styles.container}>
				<Header
					iconName="check"
					onIconPress={handleNext}
					iconShowLength={passName.length}
					headerTitle="Name Pass"
				/>

				<View style={styles.content}>
					<TextInput
						style={styles.input}
						onChangeText={setPassName}
						value={passName}
						placeholder=""
						placeholderTextColor="#888"
						autoFocus={true}
						cursorColor="white"
						selectionColor="white"
						onSubmitEditing={handleNext}
					/>
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "black",
	},
	content: {
		flex: 1,
		justifyContent: "flex-start",
		alignItems: "center",
		padding: 20,
	},
	input: {
		width: "90%",
		borderBottomWidth: 1,
		borderBottomColor: "white",
		color: "white",
		fontSize: 24,
		fontFamily: "AkkuratLL-Regular",
		paddingVertical: 2,
		textAlign: "left",
	},
});

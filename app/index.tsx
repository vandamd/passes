import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Stack, Link, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { MaterialIcons } from "@expo/vector-icons";
import { StyledText } from "../components/StyledText";
import { usePasses, Pass } from "../contexts/PassesContext";
import { HapticPressable } from "../components/HapticPressable";

export default function Index() {
	const [fontsLoaded, fontError] = useFonts({
		"AkkuratLL-Regular": require("../assets/fonts/AkkuratLL-Regular.otf"),
	});
	const { passes } = usePasses();
	const router = useRouter();

	if (!fontsLoaded && !fontError) {
		return null;
	}

	const renderPassItem = ({ item }: { item: Pass }) => (
		<HapticPressable
			style={styles.passItem}
			onPress={() =>
				router.push({
					pathname: "/add/qrDisplay",
					params: {
						passId: item.id,
						scannedData: item.data,
						passName: item.name,
					},
				})
			}
		>
			<StyledText style={styles.passName}>{item.name}</StyledText>
		</HapticPressable>
	);

	return (
		<>
			<Stack.Screen />
			<View style={styles.outerContainer}>
				{passes.length === 0 ? (
					<View style={styles.emptyContainer}>
						<StyledText style={styles.emptyText}>
							No passes saved yet.
						</StyledText>
						<StyledText style={styles.emptySubText}>
							Press the '+' button to add a new pass.
						</StyledText>
					</View>
				) : (
					<FlatList
						data={passes}
						renderItem={renderPassItem}
						keyExtractor={(item) => item.id}
						style={styles.list}
						overScrollMode={"never"}
					/>
				)}
				<View style={styles.bottomNav}>
					<Link href="/add/name" asChild>
						<HapticPressable>
							<MaterialIcons
								name="add-circle-outline"
								size={40}
								color="white"
							/>
						</HapticPressable>
					</Link>
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	outerContainer: {
		flex: 1,
		backgroundColor: "black",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	emptyText: {
		fontSize: 26,
		textAlign: "center",
		marginBottom: 10,
	},
	emptySubText: {
		fontSize: 16,
		textAlign: "center",
	},
	list: {
		flex: 1,
		paddingTop: 36,
	},
	passItem: {
		paddingVertical: 10,
		paddingHorizontal: 34,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	passName: {
		fontSize: 30,
		color: "white",
	},
	bottomNav: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 11,
		paddingHorizontal: 20,
	},
});

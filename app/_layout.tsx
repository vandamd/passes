import { Stack } from "expo-router";
import { PassesProvider } from "../contexts/PassesContext";
import { HapticProvider } from "../contexts/HapticContext";

export default function RootLayout() {
	return (
		<HapticProvider>
			<PassesProvider>
				<Stack
					screenOptions={{ animation: "none", headerShown: false }}
				/>
			</PassesProvider>
		</HapticProvider>
	);
}

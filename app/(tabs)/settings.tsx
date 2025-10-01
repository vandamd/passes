import { StyleSheet } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { useInvertColors } from "@/contexts/InvertColorsContext";

export default function SettingsScreen() {
	const { invertColors, setInvertColors } = useInvertColors();

	return (
		<ContentContainer
			headerTitle="Settings"
			hideBackButton={true}
			style={styles.container}
		>
			<ToggleSwitch
				value={invertColors}
				label="Invert Colours"
				onValueChange={setInvertColors}
			/>
		</ContentContainer>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 20,
	},
});

import { StyleSheet } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { normalizedSize } from "@/utils/fontScaling";
import * as Application from "expo-application";

export default function SettingsScreen() {
	const { invertColors, setInvertColors } = useInvertColors();
	const version = Application.nativeApplicationVersion;

	return (
		<ContentContainer
			headerTitle={`Settings (v${version})`}
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
		gap: normalizedSize(20),
	},
});

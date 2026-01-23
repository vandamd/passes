import { StyleSheet } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { n } from "@/utils/scaling";
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
        gap: n(20),
    },
});

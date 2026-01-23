import React, { useState, useCallback, useMemo } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { MaterialIcons } from "@expo/vector-icons";
import { HapticPressable } from "@/components/HapticPressable";
import { useHaptic } from "@/contexts/HapticContext";
import { usePasses } from "@/contexts/PassesContext";
import { n } from "@/utils/scaling";

export default function RenamePassScreen() {
    const { invertColors } = useInvertColors();
    const { triggerHaptic } = useHaptic();
    const [passName, setPassName] = useState("");
    const router = useRouter();
    const { currentName, passId } = useLocalSearchParams<{
        currentName?: string;
        passId?: string;
    }>();
    const { updatePassName } = usePasses();

    useFocusEffect(
        useCallback(() => {
            setPassName(currentName || "");
        }, [currentName])
    );

    const handleSave = useCallback(() => {
        if (passId && passName.trim()) {
            updatePassName(passId, passName.trim());
        }
        router.back();
    }, [passId, passName, updatePassName, router]);

    const handleClear = useCallback(() => {
        setPassName("");
        triggerHaptic();
    }, [triggerHaptic]);

    const dynamicStyles = useMemo(
        () => ({
            container: { gap: n(32) },
            inputContainerBorder: { borderBottomColor: invertColors ? "black" : "white" },
            inputText: { color: invertColors ? "black" : "white" },
        }),
        [invertColors]
    );

    const cursorColor = invertColors ? "black" : "white";
    const iconColor = invertColors ? "black" : "white";

    return (
        <ContentContainer
            headerTitle="Rename Pass"
            rightIcon="check"
            onRightIconPress={handleSave}
            showRightIcon={passName.length > 0}
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
                    onSubmitEditing={handleSave}
                />
                <HapticPressable
                    style={[styles.clearButton, { opacity: passName.length > 0 ? 1 : 0 }]}
                    onPress={handleClear}
                    disabled={passName.length === 0}
                >
                    <MaterialIcons name="clear" size={n(24)} color={iconColor} />
                </HapticPressable>
            </View>
        </ContentContainer>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        borderBottomWidth: n(1),
    },
    input: {
        flex: 1,
        fontSize: n(24),
        fontFamily: "PublicSans-Regular",
        paddingVertical: n(2),
        textAlign: "left",
        paddingBottom: n(6),
    },
    clearButton: {
        padding: n(5),
    },
});

import React, { useState, useCallback } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { MaterialIcons } from "@expo/vector-icons";
import { HapticPressable } from "@/components/HapticPressable";
import { useHaptic } from "@/contexts/HapticContext";
import { usePasses } from "@/contexts/PassesContext";
import { n } from "@/utils/scaling";

export default function PassNameScreen() {
    const { invertColors } = useInvertColors();
    const { triggerHaptic } = useHaptic();
    const { updatePassName } = usePasses();
    const [passName, setPassName] = useState("");
    const router = useRouter();

    const { mode, passId, currentName, scannedData, scannedRawData, scannedType } = useLocalSearchParams<{
        mode?: "create" | "rename";
        passId?: string;
        currentName?: string;
        scannedData?: string;
        scannedRawData?: string;
        scannedType?: string;
    }>();

    const isRenameMode = mode === "rename";
    const headerTitle = isRenameMode ? "Rename Pass" : "Name Pass";

    useFocusEffect(
        useCallback(() => {
            setPassName(isRenameMode ? (currentName || "") : "");
        }, [isRenameMode, currentName])
    );

    const handleSubmit = useCallback(() => {
        if (isRenameMode && passId && passName.trim()) {
            updatePassName(passId, passName.trim());
            router.back();
        } else if (!isRenameMode && (scannedData || scannedRawData) && scannedType) {
            router.push({
                pathname: "/detail/qrDisplay",
                params: {
                    scannedData,
                    scannedRawData,
                    scannedType,
                    passName: passName.trim(),
                },
            });
        }
    }, [isRenameMode, passId, passName, updatePassName, router, scannedData, scannedRawData, scannedType]);

    const handleClear = useCallback(() => {
        setPassName("");
        triggerHaptic();
    }, [triggerHaptic]);

    const textColor = invertColors ? "black" : "white";

    return (
        <ContentContainer
            headerTitle={headerTitle}
            rightIcon="check"
            onRightIconPress={handleSubmit}
            showRightIcon={passName.length > 0}
            style={{ gap: n(32) }}
        >
            <View style={[styles.inputContainer, { borderBottomColor: textColor }]}>
                <TextInput
                    style={[styles.input, { color: textColor }]}
                    placeholderTextColor="#888"
                    value={passName}
                    placeholder="Pass Name"
                    onChangeText={setPassName}
                    autoFocus={true}
                    cursorColor={textColor}
                    selectionColor={textColor}
                    onSubmitEditing={handleSubmit}
                />
                <HapticPressable
                    style={[styles.clearButton, { opacity: passName.length > 0 ? 1 : 0 }]}
                    onPress={handleClear}
                    disabled={passName.length === 0}
                >
                    <MaterialIcons name="clear" size={n(24)} color={textColor} />
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

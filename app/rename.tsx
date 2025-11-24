import React, { useState, useCallback } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Stack, useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { MaterialIcons } from "@expo/vector-icons";
import { HapticPressable } from "@/components/HapticPressable";
import * as Haptics from "expo-haptics";
import { usePasses } from "@/contexts/PassesContext";
import { scaledFontSize, normalizedSize } from "@/utils/fontScaling";

export default function RenamePassScreen() {
    const { invertColors } = useInvertColors();
    const [passName, setPassName] = useState("");
    const router = useRouter();
    const { currentName, passId } = useLocalSearchParams();
    const { updatePassName } = usePasses();

    useFocusEffect(
        useCallback(() => {
            setPassName((currentName as string) || "");
        }, [currentName])
    );

    const handleSave = () => {
        if (passId && passName.trim()) {
            updatePassName(passId as string, passName.trim());
        }
        router.back();
    };

    return (
        <>
            <Stack.Screen />
            <ContentContainer
                headerTitle="Rename Pass"
                headerIcon="check"
                headerIconPress={handleSave}
                headerIconShowLength={passName.length}
                style={{ gap: normalizedSize(32) }}
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
                        onSubmitEditing={handleSave}
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
                                size={normalizedSize(24)}
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
        borderBottomWidth: normalizedSize(1),
    },
    input: {
        flex: 1,
        fontSize: scaledFontSize(24),
        fontFamily: "PublicSans-Regular",
        paddingVertical: normalizedSize(2),
        textAlign: "left",
        paddingBottom: normalizedSize(6),
    },
    clearButton: {
        padding: normalizedSize(5),
    },
});

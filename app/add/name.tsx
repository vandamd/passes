import React, { useState, useCallback, useMemo } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { MaterialIcons } from "@expo/vector-icons";
import { HapticPressable } from "@/components/HapticPressable";
import { useHaptic } from "@/contexts/HapticContext";
import { n } from "@/utils/scaling";

export default function NamePassScreen() {
    const { invertColors } = useInvertColors();
    const { triggerHaptic } = useHaptic();
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
            headerTitle="Name Pass"
            rightIcon="check"
            onRightIconPress={handleNext}
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
                    onSubmitEditing={handleNext}
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

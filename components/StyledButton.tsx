import React from "react";
import { StyleSheet } from "react-native";
import { StyledText } from "./StyledText";
import { HapticPressable } from "./HapticPressable";
import { scaledFontSize } from "@/utils/fontScaling";

interface ButtonProps {
    text: string;
    onPress?: () => void;
}

export const StyledButton = React.memo(({ text, onPress }: ButtonProps) => {
    return (
        <HapticPressable style={styles.button} onPress={onPress}>
            <StyledText style={styles.buttonText} numberOfLines={1}>{text}</StyledText>
        </HapticPressable>
    );
});

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
    },
    buttonText: {
        fontSize: scaledFontSize(30),
        flex: 1,
        textAlign: "left",
    },
});


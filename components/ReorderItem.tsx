import React from "react";
import { View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StyledText } from "./StyledText";
import { HapticPressable } from "./HapticPressable";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { n } from "@/utils/scaling";

interface ReorderItemProps {
    label: string;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDelete?: () => void;
    isFirst?: boolean;
    isLast?: boolean;
    hasScrollbar?: boolean;
}

export function ReorderItem({
    label,
    onMoveUp,
    onMoveDown,
    onDelete,
    isFirst = false,
    isLast = false,
    hasScrollbar = false,
}: ReorderItemProps) {
    const { invertColors } = useInvertColors();
    const iconColor = invertColors ? "black" : "white";
    const disabledColor = invertColors ? "#C1C1C1" : "#6E6E6E";

    return (
        <View style={styles.container}>
            <View style={styles.labelContainer}>
                <StyledText style={styles.label} numberOfLines={1}>{label}</StyledText>
            </View>
            <View style={[styles.arrowContainer, !hasScrollbar && { paddingRight: 0 }]}>
                <HapticPressable
                    onPress={onMoveDown}
                    disabled={isLast}
                    style={styles.arrowButton}
                >
                    <MaterialIcons
                        name="keyboard-arrow-down"
                        size={n(32)}
                        color={isLast ? disabledColor : iconColor}
                    />
                </HapticPressable>
                <HapticPressable
                    onPress={onMoveUp}
                    disabled={isFirst}
                    style={styles.arrowButton}
                >
                    <MaterialIcons
                        name="keyboard-arrow-up"
                        size={n(32)}
                        color={isFirst ? disabledColor : iconColor}
                    />
                </HapticPressable>
                {onDelete && (
                    <HapticPressable onPress={onDelete} style={styles.arrowButton}>
                        <MaterialIcons
                            name="delete"
                            size={n(28)}
                            color={iconColor}
                        />
                    </HapticPressable>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
    },
    labelContainer: {
        flex: 1,
        paddingRight: n(10),
    },
    label: {
        fontSize: n(30),
    },
    arrowContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: n(4),
        paddingRight: n(14),
    },
    arrowButton: {
        paddingHorizontal: n(4),
    },
});

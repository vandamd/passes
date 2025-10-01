import React, { useCallback, useMemo } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StyledText } from "./StyledText";
import { HapticPressable } from "./HapticPressable";
import { useInvertColors } from "@/contexts/InvertColorsContext";

interface HeaderProps {
    iconName?: keyof typeof MaterialIcons.glyphMap;
    onIconPress?: () => void;
    iconShowLength?: number;
    headerTitle?: string;
    backEvent?: () => void;
    hideBackButton?: boolean;
    onTitlePress?: () => void;
}

export const Header = React.memo(({
    iconName,
    onIconPress,
    iconShowLength = 1,
    headerTitle,
    backEvent,
    hideBackButton = false,
    onTitlePress,
}: HeaderProps) => {
    const { invertColors } = useInvertColors();

    const handleBack = useCallback(() => {
        if (backEvent) {
            backEvent();
        } else if (router.canGoBack()) {
            router.back();
        }
    }, [backEvent]);

    const headerBg = useMemo(() => ({
        backgroundColor: invertColors ? "white" : "black"
    }), [invertColors]);

    const iconColor = invertColors ? "black" : "white";

    return (
        <View style={[styles.header, headerBg]}>
            {!hideBackButton ? (
                <HapticPressable onPress={handleBack}>
                    <View style={styles.iconContainerLeft}>
                        <MaterialIcons
                            name="arrow-back-ios"
                            size={28}
                            color={iconColor}
                        />
                    </View>
                </HapticPressable>
            ) : (
                <View style={styles.iconContainerLeft}></View>
            )}

            {onTitlePress ? (
                <HapticPressable onPress={onTitlePress} style={styles.titleContainer}>
                    <StyledText style={[styles.title]} numberOfLines={1}>
                        {headerTitle}
                    </StyledText>
                </HapticPressable>
            ) : (
                <StyledText style={[styles.title]} numberOfLines={1}>
                    {headerTitle}
                </StyledText>
            )}
            {iconShowLength > 0 && iconName ? (
                <HapticPressable onPress={onIconPress}>
                    <View style={styles.iconContainerRight}>
                        <MaterialIcons
                            name={iconName}
                            size={28}
                            color={iconColor}
                        />
                    </View>
                </HapticPressable>
            ) : (
                <View style={styles.iconContainerRight}></View>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 22,
        paddingVertical: 5,
        zIndex: 1,
    },
    title: {
        fontSize: 20,
        fontFamily: "PublicSans-Regular",
        paddingTop: 2,
        maxWidth: "75%",
    },
    titleContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    iconContainerLeft: {
        width: 32,
        height: 32,
        alignItems: "center",
        paddingTop: 6,
        paddingRight: 4,
    },
    iconContainerRight: {
        width: 32,
        height: 32,
        alignItems: "center",
        paddingTop: 6,
        paddingLeft: 4,
    },
});

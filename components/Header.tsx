import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StyledText } from "./StyledText";
import { HapticPressable } from "./HapticPressable";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { n } from "@/utils/scaling";

interface HeaderProps {
    headerTitle?: string;
    hideBackButton?: boolean;
    backEvent?: () => void;
    leftIcon?: keyof typeof MaterialIcons.glyphMap;
    leftIconSize?: number;
    onLeftIconPress?: () => void;
    rightIcon?: keyof typeof MaterialIcons.glyphMap;
    onRightIconPress?: () => void;
    rightIconShowLength?: number;
    backgroundColor?: string;
    iconColor?: string;
    onTitlePress?: () => void;
}

export function Header({
    headerTitle,
    hideBackButton = false,
    backEvent,
    leftIcon,
    leftIconSize = 28,
    onLeftIconPress,
    rightIcon,
    onRightIconPress,
    rightIconShowLength = 1,
    backgroundColor,
    iconColor: iconColorProp,
    onTitlePress,
}: HeaderProps) {
    const { invertColors } = useInvertColors();
    const defaultIconColor = invertColors ? "black" : "white";
    const iconColor = iconColorProp ?? defaultIconColor;
    const defaultBgColor = invertColors ? "white" : "black";
    const bgColor = backgroundColor ?? defaultBgColor;

    const handleBack = backEvent ?? (() => {
        if (router.canGoBack()) {
            router.back();
        }
    });

    const renderLeftButton = () => {
        if (!hideBackButton) {
            return (
                <HapticPressable onPress={handleBack}>
                    <View style={styles.button}>
                        <MaterialIcons
                            name="arrow-back-ios"
                            size={n(28)}
                            color={iconColor}
                        />
                    </View>
                </HapticPressable>
            );
        }
        if (leftIcon) {
            return (
                <HapticPressable onPress={onLeftIconPress}>
                    <View style={styles.button}>
                        <MaterialIcons
                            name={leftIcon}
                            size={n(leftIconSize)}
                            color={iconColor}
                        />
                    </View>
                </HapticPressable>
            );
        }
        return <View style={styles.button} />;
    };

    const renderRightButton = () => {
        if (rightIcon && rightIconShowLength > 0) {
            return (
                <HapticPressable onPress={onRightIconPress}>
                    <View style={styles.button}>
                        <MaterialIcons
                            name={rightIcon}
                            size={n(28)}
                            color={iconColor}
                        />
                    </View>
                </HapticPressable>
            );
        }
        return <View style={styles.button} />;
    };

    const renderTitle = () => {
        const titleElement = (
            <StyledText style={styles.title} numberOfLines={1}>
                {headerTitle}
            </StyledText>
        );

        if (onTitlePress) {
            return (
                <HapticPressable onPress={onTitlePress} style={styles.titleWrapper}>
                    {titleElement}
                </HapticPressable>
            );
        }
        return <View style={styles.titleWrapper}>{titleElement}</View>;
    };

    return (
        <View
            style={[
                styles.header,
                { backgroundColor: bgColor },
            ]}
        >
            {renderLeftButton()}
            {renderTitle()}
            {renderRightButton()}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: n(22),
        paddingVertical: n(5),
        zIndex: 1,
    },
    titleWrapper: {
        flex: 1,
        alignItems: "center",
    },
    title: {
        fontSize: n(20),
        fontFamily: "PublicSans-Regular",
        paddingTop: n(2),
        maxWidth: "100%",
    },
    button: {
        width: n(32),
        height: n(32),
        alignItems: "center",
        paddingTop: n(6),
        paddingRight: n(4),
    },
});


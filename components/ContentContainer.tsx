import React, { ReactNode, useCallback } from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { router } from "expo-router";
import { Header } from "@/components/Header";
import { SwipeBackContainer } from "@/components/SwipeBackContainer";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { MaterialIcons } from "@expo/vector-icons";
import { n } from "@/utils/scaling";

interface ContentContainerProps {
    headerTitle?: string;
    children?: ReactNode;
    hideBackButton?: boolean;
    leftIcon?: keyof typeof MaterialIcons.glyphMap;
    leftIconSize?: number;
    onLeftIconPress?: () => void;
    rightIcon?: keyof typeof MaterialIcons.glyphMap;
    onRightIconPress?: () => void;
    rightIconShowLength?: number;
    style?: StyleProp<ViewStyle>;
    backgroundColor?: string;
    headerIconColor?: string;
    onTitlePress?: () => void;
    onBackPress?: () => void;
}

export default function ContentContainer({
    headerTitle,
    children,
    hideBackButton = false,
    leftIcon,
    leftIconSize,
    onLeftIconPress,
    rightIcon,
    onRightIconPress,
    rightIconShowLength = 1,
    style,
    backgroundColor,
    headerIconColor,
    onTitlePress,
    onBackPress,
}: ContentContainerProps) {
    const { invertColors } = useInvertColors();
    const defaultBgColor = invertColors ? "white" : "black";
    const bgColor = backgroundColor ?? defaultBgColor;
    const canSwipeBack = Boolean(headerTitle) && !hideBackButton;

    const handleBack = useCallback(() => {
        if (onBackPress) {
            onBackPress();
            return;
        }

        if (router.canGoBack()) {
            router.back();
        }
    }, [onBackPress]);

    return (
        <SwipeBackContainer enabled={canSwipeBack} onSwipeBack={handleBack}>
            <View
                style={[
                    styles.container,
                    { backgroundColor: bgColor },
                ]}
            >
                {headerTitle && (
                    <Header
                        headerTitle={headerTitle}
                        hideBackButton={hideBackButton}
                        backEvent={handleBack}
                        leftIcon={leftIcon}
                        leftIconSize={leftIconSize}
                        onLeftIconPress={onLeftIconPress}
                        rightIcon={rightIcon}
                        onRightIconPress={onRightIconPress}
                        rightIconShowLength={rightIconShowLength}
                        backgroundColor={backgroundColor}
                        iconColor={headerIconColor}
                        onTitlePress={onTitlePress}
                    />
                )}
                <View style={[styles.content, style]}>{children ?? null}</View>
            </View>
        </SwipeBackContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
    },
    content: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "flex-start",
        paddingHorizontal: n(37),
        paddingTop: n(14),
        gap: n(47),
    },
});


import React, { useMemo } from "react";
import { Text as DefaultText, TextProps, StyleSheet } from "react-native";
import { useInvertColors } from "@/contexts/InvertColorsContext";

interface StyledTextProps extends TextProps {
    children: React.ReactNode;
}

export const StyledText = React.memo(({ style, ...rest }: StyledTextProps) => {
    const { invertColors } = useInvertColors();

    const textColor = useMemo(() => ({
        color: invertColors ? "black" : "white"
    }), [invertColors]);

    return (
        <DefaultText
            allowFontScaling={false}
            style={[
                styles.text,
                textColor,
                style,
            ]}
            {...rest}
        />
    );
});

const styles = StyleSheet.create({
    text: {
        fontFamily: "PublicSans-Regular",
    },
});

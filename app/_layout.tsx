import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { HapticProvider } from "../contexts/HapticContext";
import {
    InvertColorsProvider,
    useInvertColors,
} from "@/contexts/InvertColorsContext";
import { useFonts } from "expo-font";
import { setStatusBarHidden } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PassesProvider } from "@/contexts/PassesContext";
import * as NavigationBar from 'expo-navigation-bar';

function RootNavigation() {
    const [fontsLoaded] = useFonts({
        "PublicSans-Regular": require("../assets/fonts/PublicSans-Regular.ttf"),
    });

    const { invertColors } = useInvertColors();

    useEffect(() => {
        setStatusBarHidden(true, "none");
        NavigationBar.setVisibilityAsync("hidden");
    }, []);

    useEffect(() => {
        const newColor = invertColors ? "#FFFFFF" : "#000000";
        SystemUI.setBackgroundColorAsync(newColor);
    }, [invertColors]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: "none",
                contentStyle: { backgroundColor: "#000000" },
            }}
        ></Stack>
    );
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <HapticProvider>
                <InvertColorsProvider>
                    <PassesProvider>
                        <RootNavigation />
                    </PassesProvider>
                </InvertColorsProvider>
            </HapticProvider>
        </SafeAreaProvider>
    );
}

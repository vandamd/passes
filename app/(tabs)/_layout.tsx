import React from "react";
import { Tabs } from "expo-router";
import { Navbar, TabConfigItem } from "@/components/Navbar";

export const TABS_CONFIG: ReadonlyArray<TabConfigItem> = [
    { name: "Passes", screenName: "passes", iconName: "qr-code" },
    { name: "Scan", screenName: "scan", iconName: "camera-alt", isExternalRoute: true },
    { name: "Settings", screenName: "settings", iconName: "settings" },
] as const;

export default function TabLayout() {
    return (
        <Tabs
            initialRouteName="passes"
            screenOptions={() => ({
                animation: "none",
                headerShown: false,
            })}
            tabBar={(props) => {
                const activeScreenName =
                    props.state.routes[props.state.index].name;
                return (
                    <Navbar
                        tabsConfig={TABS_CONFIG}
                        currentScreenName={activeScreenName}
                        navigation={props.navigation}
                    />
                );
            }}
        >
            <Tabs.Screen name="passes" options={{ header: () => null }} />
            <Tabs.Screen name="settings" options={{ header: () => null }} />
        </Tabs>
    );
}

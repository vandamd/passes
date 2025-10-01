import React, { useCallback, useMemo } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { HapticPressable } from "./HapticPressable";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { useRouter } from "expo-router";

export interface TabConfigItem {
	name: string;
	screenName: string;
	iconName: keyof typeof MaterialIcons.glyphMap;
	isExternalRoute?: boolean;
}

interface NavbarProps {
	tabsConfig?: ReadonlyArray<TabConfigItem>;
	currentScreenName: string;
	navigation: BottomTabBarProps["navigation"];
	showPlayingButton?: boolean;
}

const NavItem = React.memo(({
	tab,
	isActive,
	invertColors,
	onPress
}: {
	tab: TabConfigItem;
	isActive: boolean;
	invertColors: boolean;
	onPress: () => void;
}) => {
	const iconColor = useMemo(() => {
		if (isActive) {
			return invertColors ? "black" : "white";
		}
		return invertColors ? "#C1C1C1" : "#6E6E6E";
	}, [isActive, invertColors]);

	return (
		<HapticPressable onPress={onPress}>
			<MaterialIcons
				name={tab.iconName}
				size={48}
				color={iconColor}
			/>
		</HapticPressable>
	);
});

export const Navbar = React.memo(({
	tabsConfig,
	currentScreenName,
	navigation,
}: NavbarProps) => {
	const { invertColors } = useInvertColors();
	const router = useRouter();

	const navbarBg = useMemo(() => ({
		backgroundColor: invertColors ? "white" : "black"
	}), [invertColors]);

	const handleTabPress = useCallback((tab: TabConfigItem) => {
		if (tab.isExternalRoute) {
			router.push(`/${tab.screenName}`);
		} else {
			navigation.navigate(tab.screenName);
		}
	}, [router, navigation]);

	return (
		<View style={[styles.navbar, navbarBg]}>
			{tabsConfig?.map((tab) => (
				<NavItem
					key={tab.screenName}
					tab={tab}
					isActive={tab.screenName === currentScreenName}
					invertColors={invertColors}
					onPress={() => handleTabPress(tab)}
				/>
			))}
		</View>
	);
});

const styles = StyleSheet.create({
	navbar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 11,
		paddingHorizontal: 20,
	},
});

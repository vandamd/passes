import React, { useCallback } from "react";
import { Pressable, PressableProps, GestureResponderEvent } from "react-native";
import { useHaptic } from "../contexts/HapticContext";

export const HapticPressable = React.memo((props: PressableProps) => {
	const { triggerHaptic } = useHaptic();

	const handlePress = useCallback((event: GestureResponderEvent) => {
		triggerHaptic();
		props.onPress?.(event);
	}, [triggerHaptic, props.onPress]);

	return (
		<Pressable
			{...props}
			onPress={handlePress}
			android_disableSound={true}
		/>
	);
});

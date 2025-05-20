import * as Haptics from "expo-haptics";
import { Pressable, PressableProps } from "react-native";

export const useHaptic = () => {
	const hapticPress = (props: PressableProps): PressableProps => {
		return {
			...props,
			onPressIn: (event) => {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				props.onPressIn?.(event);
			},
		};
	};

	return { hapticPress };
};

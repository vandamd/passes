import { Pressable, PressableProps } from "react-native";
import { useHaptic } from "../contexts/HapticContext";

export const HapticPressable = (props: PressableProps) => {
	const { triggerHaptic } = useHaptic();

	return (
		<Pressable
			{...props}
			onPressIn={(event) => {
				triggerHaptic();
				props.onPressIn?.(event);
			}}
			android_disableSound={true}
		/>
	);
};

import React, { useState, useRef, PropsWithChildren, useMemo, useCallback } from "react";
import {
	ScrollView,
	View,
	Animated,
	StyleSheet,
	ScrollViewProps,
	NativeSyntheticEvent,
	NativeScrollEvent,
} from "react-native";
import { useInvertColors } from "@/contexts/InvertColorsContext";

interface CustomScrollViewProps extends ScrollViewProps {
	// We can add any custom props here if needed in the future
}

const CustomScrollView: React.FC<PropsWithChildren<CustomScrollViewProps>> = React.memo(({
	children,
	style,
	contentContainerStyle,
	...rest
}) => {
	const { invertColors } = useInvertColors();
	const [contentHeight, setContentHeight] = useState<number>(0);
	const [scrollViewHeight, setScrollViewHeight] = useState<number>(0);
	const scrollY = useRef(new Animated.Value(0)).current;

	const scrollIndicatorHeight = useMemo(() => {
		if (scrollViewHeight > 0 && contentHeight > 0 && contentHeight > scrollViewHeight) {
			return Math.max((scrollViewHeight * scrollViewHeight) / contentHeight, 20);
		}
		return 0;
	}, [scrollViewHeight, contentHeight]);

	const scrollIndicatorPosition = useMemo(() => {
		if (contentHeight > scrollViewHeight && scrollIndicatorHeight > 0) {
			return scrollY.interpolate({
				inputRange: [0, contentHeight - scrollViewHeight],
				outputRange: [0, scrollViewHeight - scrollIndicatorHeight],
				extrapolate: "clamp",
			});
		}
		return 0;
	}, [contentHeight, scrollViewHeight, scrollIndicatorHeight, scrollY]);

	const handleScroll = useMemo(() => Animated.event(
		[{ nativeEvent: { contentOffset: { y: scrollY } } }],
		{
			useNativeDriver: false,
			listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
				if (rest.onScroll) {
					rest.onScroll(event);
				}
			},
		}
	), [scrollY, rest.onScroll]);

	const handleContentSizeChange = useCallback((width: number, height: number) => {
		setContentHeight(height);
		if (rest.onContentSizeChange) {
			rest.onContentSizeChange(width, height);
		}
	}, [rest.onContentSizeChange]);

	const handleLayout = useCallback((event: any) => {
		const { height } = event.nativeEvent.layout;
		setScrollViewHeight(height);
		if (rest.onLayout) {
			rest.onLayout(event);
		}
	}, [rest.onLayout]);

	const scrollViewStyle = useMemo(() => [{ width: "100%" }, style], [style]);
	const scrollContentStyle = useMemo(() => [{ flexGrow: 1 }, contentContainerStyle], [contentContainerStyle]);

	const trackBgColor = useMemo(() => ({
		backgroundColor: invertColors ? "black" : "white"
	}), [invertColors]);

	const thumbStyle = useMemo(() => ({
		backgroundColor: invertColors ? "black" : "white",
		height: scrollIndicatorHeight,
		transform: [{ translateY: scrollIndicatorPosition as any }],
	}), [invertColors, scrollIndicatorHeight, scrollIndicatorPosition]);

	return (
		<View style={styles.container}>
			<ScrollView
				style={scrollViewStyle}
				contentContainerStyle={scrollContentStyle}
				showsVerticalScrollIndicator={false}
				overScrollMode="never"
				onContentSizeChange={handleContentSizeChange}
				onLayout={handleLayout}
				onScroll={handleScroll}
				scrollEventThrottle={16}
				{...rest}
			>
				{children}
			</ScrollView>
			{scrollIndicatorHeight > 0 && (
				<View style={[styles.scrollIndicatorTrack, styles.trackTransform, trackBgColor]}>
					<Animated.View style={[styles.scrollIndicatorThumb, thumbStyle]} />
				</View>
			)}
		</View>
	);
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: "row",
		width: "100%",
	},
	scrollIndicatorTrack: {
		width: 1,
		height: "100%",
		position: "absolute",
		right: -18,
	},
	trackTransform: {
		transform: [{ translateX: 1 }],
	},
	scrollIndicatorThumb: {
		width: 5,
		position: "absolute",
		right: -2,
	},
});

export default CustomScrollView;

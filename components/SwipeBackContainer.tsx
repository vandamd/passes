import { ReactNode, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useHaptic } from "@/contexts/HapticContext";

const EDGE_THRESHOLD = 30;
const DRAG_THRESHOLD = 80;

interface SwipeBackContainerProps {
    children: ReactNode;
    enabled?: boolean;
    onSwipeBack: () => void;
}

export function SwipeBackContainer({
    children,
    enabled = true,
    onSwipeBack,
}: SwipeBackContainerProps) {
    const { triggerHaptic } = useHaptic();
    const hasTriggeredRef = useRef(false);

    const swipeBackGesture = useMemo(
        () =>
            Gesture.Pan()
                .enabled(enabled)
                .hitSlop({ left: 0, width: EDGE_THRESHOLD })
                .activeOffsetX(12)
                .onBegin(() => {
                    hasTriggeredRef.current = false;
                })
                .onUpdate((event: { translationX: number; translationY: number }) => {
                    if (hasTriggeredRef.current) return;

                    const absX = Math.abs(event.translationX);
                    const absY = Math.abs(event.translationY);

                    if (absY > absX * 1.5) return;

                    if (event.translationX > DRAG_THRESHOLD) {
                        hasTriggeredRef.current = true;
                        triggerHaptic();
                        onSwipeBack();
                    }
                })
                .onFinalize(() => {
                    hasTriggeredRef.current = false;
                })
                .runOnJS(true),
        [enabled, onSwipeBack, triggerHaptic]
    );

    return (
        <GestureDetector gesture={swipeBackGesture}>
            <View style={styles.container}>{children}</View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});


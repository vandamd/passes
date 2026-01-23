import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import CustomScrollView, { CustomScrollViewRef } from "@/components/CustomScrollView";
import { ReorderItem } from "@/components/ReorderItem";
import { CenteredMessage } from "@/components/CenteredMessage";
import { usePasses } from "@/contexts/PassesContext";
import { n } from "@/utils/scaling";

export default function ReorderPassesScreen() {
    const { passes, reorderPass, deletePass } = usePasses();
    const params = useLocalSearchParams<{ confirmed?: string; action?: string; passId?: string }>();
    const [hasScrollbar, setHasScrollbar] = useState(false);
    const scrollViewRef = useRef<CustomScrollViewRef>(null);

    useFocusEffect(
        React.useCallback(() => {
            scrollViewRef.current?.scrollToTop();
        }, [])
    );

    useEffect(() => {
        if (params.confirmed === "true" && params.action === "deletePass" && params.passId) {
            router.setParams({ confirmed: undefined, action: undefined, passId: undefined });
            deletePass(params.passId);
        }
    }, [params.confirmed, params.action, params.passId, deletePass]);

    const handleDelete = (id: string, name: string) => {
        router.push({
            pathname: "/confirm",
            params: {
                title: "Delete Pass",
                message: `Are you sure you want to delete "${name}"?`,
                confirmText: "Delete",
                action: "deletePass",
                returnPath: "/reorder-passes",
                returnParams: JSON.stringify({ passId: id }),
            },
        });
    };

    if (passes.length === 0) {
        return (
            <ContentContainer headerTitle="Reorder Passes">
                <CenteredMessage message="No passes" />
            </ContentContainer>
        );
    }

    return (
        <ContentContainer headerTitle="Reorder Passes" style={styles.container}>
            <CustomScrollView
                ref={scrollViewRef}
                data={passes}
                onScrollableChange={setHasScrollbar}
                renderItem={({ item, index }) => (
                    <ReorderItem
                        label={item.name}
                        onMoveUp={() => reorderPass(item.id, "up")}
                        onMoveDown={() => reorderPass(item.id, "down")}
                        onDelete={() => handleDelete(item.id, item.name)}
                        isFirst={index === 0}
                        isLast={index === passes.length - 1}
                        hasScrollbar={hasScrollbar}
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={{ height: n(15) }} />}
            />
        </ContentContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: n(20),
    },
    listContent: {
        paddingBottom: n(20),
    },
});

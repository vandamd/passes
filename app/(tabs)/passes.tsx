import { useCallback } from "react";
import ContentContainer from "@/components/ContentContainer";
import { router } from "expo-router";
import CustomScrollView from "@/components/CustomScrollView";
import { CenteredMessage } from "@/components/CenteredMessage";
import { usePasses } from "@/contexts/PassesContext";
import { StyledButton } from "@/components/StyledButton";
import { View, StyleSheet } from "react-native";
import { Pass } from "@/types/pass";
import { n } from "@/utils/scaling";

export default function PassesScreen() {
    const { passes } = usePasses();

    const handlePassPress = useCallback((pass: Pass) => {
        router.push({
            pathname: "/add/qrDisplay",
            params: {
                passId: pass.id,
                scannedData: pass.data,
                passName: pass.name,
            },
        });
    }, []);

    const renderItem = useCallback(
        ({ item }: { item: Pass }) => (
            <View style={styles.passItem}>
                <StyledButton text={item.name} onPress={() => handlePassPress(item)} />
            </View>
        ),
        [handlePassPress]
    );

    if (passes.length === 0) {
        return (
            <ContentContainer
                headerTitle="Passes"
                hideBackButton
                rightIcon="add"
                onRightIconPress={() => router.push("/add/camera")}
                style={styles.container}
            >
                <CenteredMessage message="No passes" hint="Tap + to add a pass" />
            </ContentContainer>
        );
    }

    return (
        <ContentContainer
            headerTitle="Passes"
            hideBackButton
            leftIcon="swap-vert"
            onLeftIconPress={() => router.push("/reorder-passes")}
            rightIcon="add"
            onRightIconPress={() => router.push("/add/camera")}
            style={styles.container}
        >
            <CustomScrollView
                data={passes}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
            />
        </ContentContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: n(20),
    },
    passItem: {
        marginBottom: n(15),
    },
});

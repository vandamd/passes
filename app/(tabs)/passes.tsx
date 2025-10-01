import { useCallback } from "react";
import ContentContainer from "@/components/ContentContainer";
import { router } from "expo-router";
import CustomScrollView from "@/components/CustomScrollView";
import { usePasses } from "@/contexts/PassesContext";
import { StyledButton } from "@/components/StyledButton";
import { View, StyleSheet } from "react-native";
import { Pass } from "@/contexts/PassesContext";

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

    return (
        <ContentContainer
            headerTitle="Passes"
            hideBackButton={true}
            style={styles.container}
        >
            <CustomScrollView>
                {passes.map((pass) => (
                    <View key={pass.id} style={styles.passItem}>
                        <StyledButton
                            text={pass.name}
                            onPress={() => handlePassPress(pass)}
                        />
                    </View>
                ))}
            </CustomScrollView>
        </ContentContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 20,
    },
    passItem: {
        marginBottom: 15,
    },
});

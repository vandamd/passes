import ContentContainer from "@/components/ContentContainer";
import { router } from "expo-router";
import CustomScrollView from "@/components/CustomScrollView";
import { usePasses } from "@/contexts/PassesContext";
import { StyledButton } from "@/components/StyledButton";
import { View } from "react-native";

export default function PassesScreen() {
	const { passes } = usePasses();

	return (
		<ContentContainer
			headerTitle="Passes"
			hideBackButton={true}
			style={{ gap: 20 }}
		>
			<CustomScrollView>
				{passes.map((pass) => (
					<View key={pass.id} style={{ marginBottom: 15 }}>
						<StyledButton
							text={pass.name}
							onPress={() => {
								router.push({
									pathname: "/add/qrDisplay",
									params: {
										passId: pass.id,
										scannedData: pass.data,
										passName: pass.name,
									},
								});
							}}
							fontSize={28}
						/>
					</View>
				))}
			</CustomScrollView>
		</ContentContainer>
	);
}

import { Stack } from "expo-router";
import { PassesProvider } from "../contexts/PassesContext";

export default function RootLayout() {
  return (
    <PassesProvider>
      <Stack screenOptions={{ animation: 'none', headerShown: false }} />
    </PassesProvider>
  );
}
import React, { useState, useCallback } from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import { StyledText } from "../../components/StyledText";
import { MaterialIcons } from "@expo/vector-icons";

export default function NamePassScreen() {
  const [passName, setPassName] = useState("");
  const router = useRouter();

  // Clear input when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setPassName("");
    }, [])
  );

  const handleNext = () => {
    router.push({ pathname: "/add/camera", params: { passName } });
  };

  return (
    <>
      <Stack.Screen />
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/")}>
            <MaterialIcons name="arrow-back-ios" size={24} color="white" />
          </Pressable>
          <StyledText style={styles.title}>Name Pass</StyledText>
          {passName.length > 0 && (
            <Pressable onPress={handleNext}>
              <MaterialIcons name="check" size={28} color="white" />
            </Pressable>
          )}
          {passName.length === 0 && <View style={{ width: 28 }} />}
        </View>

        <View style={styles.content}>
          <TextInput
            style={styles.input}
            onChangeText={setPassName}
            value={passName}
            placeholder=""
            placeholderTextColor="#888"
            autoFocus
            cursorColor="white"
            selectionColor="white"
            onSubmitEditing={handleNext}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 21,
    paddingVertical: 10,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontFamily: "AkkuratLL-Regular",
    paddingBottom: 5,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
  },
  input: {
    width: "90%",
    borderBottomWidth: 1,
    borderBottomColor: "white",
    color: "white",
    fontSize: 24,
    fontFamily: "AkkuratLL-Regular",
    paddingVertical: 2,
    textAlign: "left",
  },
});
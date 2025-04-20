import { StyleSheet } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";


const RootLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <Toast />
    </>
  );
};

export default RootLayout;

const styles = StyleSheet.create({});

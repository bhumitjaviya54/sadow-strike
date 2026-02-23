import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { COLORS } from "@/constants/color";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="missions"
        options={{
          headerShown: true,
          title: "MISSIONS",
          headerStyle: { backgroundColor: COLORS.bgCard },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: "700" as const, letterSpacing: 2 },
        }}
      />
      <Stack.Screen
        name="briefing"
        options={{
          headerShown: true,
          title: "MISSION BRIEFING",
          headerStyle: { backgroundColor: COLORS.bgCard },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: "700" as const, letterSpacing: 1 },
        }}
      />
      <Stack.Screen name="game" options={{ animation: "fade" }} />
      <Stack.Screen
        name="armory"
        options={{
          headerShown: true,
          title: "ARMORY",
          headerStyle: { backgroundColor: COLORS.bgCard },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: "700" as const, letterSpacing: 2 },
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: true,
          title: "AGENT PROFILE",
          headerStyle: { backgroundColor: COLORS.bgCard },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: "700" as const, letterSpacing: 1 },
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PlayerProvider>
        <RootLayoutNav />
      </PlayerProvider>
    </GestureHandlerRootView>
  );
}

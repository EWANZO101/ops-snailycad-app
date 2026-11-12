import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as React from "react";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessionProvider, useSession } from "@/lib/session";
import { Loading } from "@/ui/components";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <SafeAreaProvider>
      <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
        <SessionProvider>
          <RootNavigator />
        </SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { status } = useSession();

  React.useEffect(() => {
    if (status !== "loading") void SplashScreen.hideAsync();
  }, [status]);

  if (status === "loading") return <Loading />;

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
      {/* no community open: welcome */}
      <Stack.Protected guard={status === "noCommunity"}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* a community is open: sign in to it */}
      <Stack.Protected guard={status === "signedOut"}>
        <Stack.Screen name="sign-in" options={{ title: "Sign in" }} />
      </Stack.Protected>

      {/* signed in: the CAD */}
      <Stack.Protected guard={status === "signedIn"}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="invite" options={{ title: "Invite people", presentation: "modal" }} />
      </Stack.Protected>

      {/* always reachable (invite links open "join") */}
      <Stack.Screen name="join" options={{ title: "Join a community" }} />
      <Stack.Screen name="start" options={{ title: "Start a community" }} />
      <Stack.Screen name="scan" options={{ title: "Scan the QR code", presentation: "modal" }} />
    </Stack>
  );
}

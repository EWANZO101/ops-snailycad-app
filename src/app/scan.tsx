import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { parseCommunityInput } from "@/lib/community";
import { Body, Button, ErrorBanner, Screen } from "@/ui/components";
import { radius } from "@/ui/theme";

/** scans a community's QR code and goes back to "join" with it */
export default function Scan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = React.useState<string | null>(null);
  const handled = React.useRef(false);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <Screen edges={["bottom"]}>
        <Body>The camera is only used to scan your community&apos;s QR code.</Body>
        <Button
          title={permission.canAskAgain ? "Allow the camera" : "Open Settings to allow the camera"}
          onPress={() => void requestPermission()}
        />
        <Button title="Type the code instead" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen edges={["bottom"]} scroll={false}>
      <Body muted>Point the camera at the QR code from your community.</Body>
      <View style={styles.frame}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={({ data }) => {
            if (handled.current) return;
            try {
              const api = parseCommunityInput(data);
              handled.current = true;
              router.dismissTo({ pathname: "/join", params: { api } });
            } catch {
              setError("That QR code isn't a community code.");
            }
          }}
        />
      </View>
      <ErrorBanner message={error} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1, borderRadius: radius.lg, overflow: "hidden", minHeight: 280 },
});

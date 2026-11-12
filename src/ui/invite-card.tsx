import * as Clipboard from "expo-clipboard";
import * as React from "react";
import { Share, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { type Community, communityCode, inviteLink } from "@/lib/community";
import { Body, Button, Card } from "./components";
import { radius, spacing, useColors } from "./theme";

/** the community code, its QR code, and copy / share buttons */
export function InviteCard({ community }: { community: Community }) {
  const colors = useColors();
  const [copied, setCopied] = React.useState(false);
  const code = communityCode(community.apiUrl);
  const link = inviteLink(community.apiUrl);

  async function copy() {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <Body muted>Members download Ops SnailyCAD, tap Join a community, and scan this:</Body>
      <View style={styles.qr} accessibilityLabel={`QR code for ${community.name}`}>
        {/* always black on white: phone cameras scan that best */}
        <QRCode value={link} size={220} backgroundColor="#ffffff" color="#000000" quietZone={12} />
      </View>
      <Body muted>Or type this community code:</Body>
      <Text selectable style={[styles.code, { color: colors.text, borderColor: colors.border }]}>
        {code}
      </Text>
      <Button title={copied ? "Copied" : "Copy the code"} variant="secondary" onPress={() => void copy()} />
      <Button
        title="Share an invite"
        onPress={() =>
          void Share.share({
            message: `Join ${community.name} on Ops SnailyCAD: open the app, tap "Join a community" and enter ${code}\n\nOr open this on your phone: ${link}`,
          })
        }
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  qr: {
    alignSelf: "center",
    padding: spacing.sm,
    backgroundColor: "#ffffff",
    borderRadius: radius.md,
  },
  code: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    fontVariant: ["tabular-nums"],
  },
});

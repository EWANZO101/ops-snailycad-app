import { router } from "expo-router";
import * as React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useSession } from "@/lib/session";
import { Body, Button, Card, CommunityBadge, Screen, Title } from "@/ui/components";
import { spacing, useColors } from "@/ui/theme";
import { communityCode } from "@/lib/community";

/** first screen: join or start a community, or reopen one this phone already has */
export default function Welcome() {
  const { communities, openCommunity, forgetCommunity } = useSession();
  const colors = useColors();

  function confirmForget(apiUrl: string, name: string) {
    Alert.alert(`Remove ${name}?`, "You can join it again later with its code.", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => void forgetCommunity(apiUrl) },
    ]);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Title>Ops SnailyCAD</Title>
        <Body muted>Your community&apos;s SnailyCAD in your pocket.</Body>
      </View>

      <Card>
        <Body>Got a community code, QR code or invite link from your community?</Body>
        <Button title="Join a community" onPress={() => router.push("/join")} />
      </Card>

      <Card>
        <Body>Run a SnailyCAD? Connect it as its owner and invite your members.</Body>
        <Button
          title="Start a community"
          variant="secondary"
          onPress={() => router.push("/start")}
        />
      </Card>

      {communities.length ? (
        <View style={{ gap: spacing.sm }}>
          <Text style={[styles.section, { color: colors.muted }]}>YOUR COMMUNITIES</Text>
          {communities.map((community) => (
            <Pressable
              key={community.apiUrl}
              accessibilityRole="button"
              accessibilityHint="Opens this community. Long-press to remove it."
              onPress={() => void openCommunity(community)}
              onLongPress={() => confirmForget(community.apiUrl, community.name)}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Card>
                <CommunityBadge name={community.name} logoUrl={community.logoUrl} />
                <Text style={{ color: colors.muted }} numberOfLines={1}>
                  {communityCode(community.apiUrl)}
                </Text>
              </Card>
            </Pressable>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, marginTop: spacing.xl, marginBottom: spacing.md },
  section: { fontSize: 13, fontWeight: "600", letterSpacing: 0.5 },
});

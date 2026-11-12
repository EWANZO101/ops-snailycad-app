import * as React from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { communityCode } from "@/lib/community";
import { useSession } from "@/lib/session";
import { Body, Button, Card } from "@/ui/components";
import { spacing, useColors } from "@/ui/theme";

const RANKS = { OWNER: "Owner", ADMIN: "Admin", USER: "User" } as const;

export default function Account() {
  const { community, user, signOut, forgetCommunity } = useSession();
  const colors = useColors();
  if (!community || !user) return null;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Card>
        <Body>{user.username}</Body>
        <Body muted>
          {RANKS[user.rank] ?? user.rank} on {community.name}
        </Body>
        <Body muted>{communityCode(community.apiUrl)}</Body>
      </Card>

      <Button title="Sign out" variant="secondary" onPress={() => void signOut()} />
      <Button
        title="Remove this community from my phone"
        variant="danger"
        onPress={() =>
          Alert.alert(`Remove ${community.name}?`, "You'll be signed out. You can join again later.", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Remove",
              style: "destructive",
              onPress: () => void forgetCommunity(community.apiUrl),
            },
          ])
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({ content: { padding: spacing.lg, gap: spacing.lg } });

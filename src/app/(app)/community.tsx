import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSession } from "@/lib/session";
import { Body, Button, CommunityBadge } from "@/ui/components";
import { InviteCard } from "@/ui/invite-card";
import { spacing, useColors } from "@/ui/theme";

/** invite people to this community, or switch to another one */
export default function CommunityTab() {
  const { community, closeCommunity } = useSession();
  const colors = useColors();
  if (!community) return null;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <CommunityBadge name={community.name} logoUrl={community.logoUrl} />
      <InviteCard community={community} />
      <Body muted>You stay signed in to this community when you switch.</Body>
      <Button
        title="Switch community"
        variant="secondary"
        onPress={() => void closeCommunity()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({ content: { padding: spacing.lg, gap: spacing.lg } });

import * as React from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { hasPermission } from "@/lib/cad-types";
import { useSession } from "@/lib/session";
import { Body, Card, CommunityBadge } from "@/ui/components";
import { spacing, useColors } from "@/ui/theme";

/**
 * Home: the CAD's sections this user can use, like the website's dashboard. Each section is built
 * in its own stage (Citizen, LEO + EMS/FD, Dispatch, Admin); until then it says so.
 */
const SECTIONS = [
  { key: "citizen", title: "Citizen", text: "Your citizens, vehicles, weapons, licenses and 911 calls.", permissions: null },
  { key: "leo", title: "LEO", text: "Status, calls, BOLOs, searches, records and incidents.", permissions: ["Leo"] },
  { key: "ems-fd", title: "EMS / FD", text: "Status, calls, medical records and incidents.", permissions: ["EmsFd"] },
  { key: "dispatch", title: "Dispatch", text: "Active units, 911 calls, incidents, BOLOs and the radio.", permissions: ["Dispatch"] },
  { key: "tow", title: "Tow", text: "Tow calls.", permissions: ["ViewTowCalls", "ManageTowCalls"] },
  { key: "taxi", title: "Taxi", text: "Taxi calls.", permissions: ["ViewTaxiCalls"] },
  {
    key: "admin",
    title: "Admin",
    text: "Users, units, citizens, values and CAD settings.",
    permissions: ["ManageCADSettings", "ViewUsers", "ManageUsers", "ViewUnits", "ManageUnits", "ViewCitizens", "ManageCitizens"],
  },
] as const;

export default function Home() {
  const { community, user, refreshUser } = useSession();
  const colors = useColors();
  const [refreshing, setRefreshing] = React.useState(false);

  if (!community || !user) return null;
  const sections = SECTIONS.filter(
    (section) => !section.permissions || hasPermission(user, [...section.permissions]),
  );

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await refreshUser().catch(() => undefined);
            setRefreshing(false);
          }}
        />
      }
    >
      <CommunityBadge name={community.name} logoUrl={community.logoUrl} />
      <Body muted>Signed in as {user.username}</Body>

      {sections.map((section) => (
        <Card key={section.key}>
          <View style={styles.row}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            <Text style={[styles.soon, { color: colors.muted, borderColor: colors.border }]}>
              Coming soon
            </Text>
          </View>
          <Body muted>{section.text}</Body>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  sectionTitle: { fontSize: 19, fontWeight: "700" },
  soon: { fontSize: 12, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, overflow: "hidden" },
});

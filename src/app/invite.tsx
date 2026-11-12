import { router, useLocalSearchParams } from "expo-router";
import * as React from "react";
import { useSession } from "@/lib/session";
import { Body, Button, ErrorBanner, Screen, Title } from "@/ui/components";
import { InviteCard } from "@/ui/invite-card";

/** after "Start a community", and from the Community tab: the code to share */
export default function Invite() {
  const { welcome } = useLocalSearchParams<{ welcome?: string }>();
  const { community, user } = useSession();
  if (!community) return null;

  const isOwner = user?.rank === "OWNER";

  return (
    <Screen edges={["bottom"]}>
      {welcome ? <Title>{community.name} is ready</Title> : null}
      {welcome && !isOwner ? (
        <ErrorBanner message="You're signed in, but not as this CAD's owner. You can still share the code: anyone with an account on this CAD can join." />
      ) : null}
      <InviteCard community={community} />
      <Body muted>
        The code only tells the app where your CAD is. People still need their own account on your
        CAD to sign in, so sharing it doesn&apos;t give anyone access.
      </Body>
      <Button
        title={welcome ? "Open the CAD" : "Done"}
        variant="secondary"
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/home"))}
      />
    </Screen>
  );
}

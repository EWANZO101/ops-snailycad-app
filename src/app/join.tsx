import { router, useLocalSearchParams } from "expo-router";
import * as React from "react";
import { describeError } from "@/lib/api";
import { type Community, parseCommunityInput } from "@/lib/community";
import { useSession } from "@/lib/session";
import { Body, Button, Card, CommunityBadge, ErrorBanner, Field, Screen } from "@/ui/components";

/**
 * Join: type the community code, scan the QR code, or open an invite link
 * (opssnailycad://join?api=...), which lands here with `api` filled in.
 */
export default function Join() {
  const params = useLocalSearchParams<{ api?: string }>();
  const { lookUpCommunity, openCommunity } = useSession();
  const [code, setCode] = React.useState(params.api ?? "");
  // a new invite link / QR code while this screen is open: show its code
  const [shownParam, setShownParam] = React.useState(params.api);
  if (params.api !== shownParam) {
    setShownParam(params.api);
    if (params.api) setCode(params.api);
  }
  const [found, setFound] = React.useState<Community | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const lookUp = React.useCallback(
    async (input: string) => {
      setError(null);
      setFound(null);
      setBusy(true);
      try {
        setFound(await lookUpCommunity(parseCommunityInput(input)));
      } catch (lookupError) {
        setError(describeError(lookupError));
      } finally {
        setBusy(false);
      }
    },
    [lookUpCommunity],
  );

  // invite link or QR code: look it up straight away
  React.useEffect(() => {
    const api = params.api;
    if (!api) return;
    let cancelled = false;
    void (async () => {
      try {
        const community = await lookUpCommunity(parseCommunityInput(api));
        if (!cancelled) {
          setError(null);
          setFound(community);
        }
      } catch (lookupError) {
        if (!cancelled) setError(describeError(lookupError));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.api, lookUpCommunity]);

  return (
    <Screen edges={["bottom"]}>
      <Body muted>
        Ask your community for its code (it looks like a web address, e.g.
        cad-api.yourcommunity.com), or scan its QR code.
      </Body>

      <Field
        label="Community code"
        value={code}
        onChangeText={(text) => {
          setCode(text);
          setFound(null);
        }}
        placeholder="cad-api.yourcommunity.com"
        autoCapitalize="none"
        keyboardType="url"
        textContentType="URL"
        returnKeyType="go"
        onSubmitEditing={() => void lookUp(code)}
      />
      <ErrorBanner message={error} />

      {found ? (
        <Card>
          <CommunityBadge name={found.name} logoUrl={found.logoUrl} />
          <Button title={`Join ${found.name}`} onPress={() => void openCommunity(found, "join")} />
        </Card>
      ) : (
        <Button title="Continue" loading={busy} disabled={!code.trim()} onPress={() => void lookUp(code)} />
      )}

      <Button title="Scan a QR code" variant="secondary" onPress={() => router.push("/scan")} />
    </Screen>
  );
}

import * as React from "react";
import { describeError } from "@/lib/api";
import { type Community, parseCommunityInput } from "@/lib/community";
import { useSession } from "@/lib/session";
import { Body, Button, Card, CommunityBadge, ErrorBanner, Field, Screen } from "@/ui/components";

/**
 * Start a community (the CAD owner): enter the CAD's API address, sign in as the owner, get the
 * community code / QR code to share. Nothing is stored on any server: the code is the address.
 */
export default function Start() {
  const { lookUpCommunity, openCommunity } = useSession();
  const [address, setAddress] = React.useState("");
  const [found, setFound] = React.useState<Community | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function check() {
    setError(null);
    setFound(null);
    setBusy(true);
    try {
      setFound(await lookUpCommunity(parseCommunityInput(address)));
    } catch (checkError) {
      const message = describeError(checkError);
      setError(
        message.includes("isn't a SnailyCAD API")
          ? `${message} Use the API address (NEXT_PUBLIC_PROD_ORIGIN in your CAD's .env), not the website address.`
          : message,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen edges={["bottom"]}>
      <Body>
        Connect your SnailyCAD to the app. Your members then join with a code or QR code, and sign
        in with their own CAD accounts.
      </Body>
      <Body muted>
        You need to be the CAD&apos;s owner. No API token is needed, and nothing is sent anywhere
        except to your own CAD.
      </Body>

      <Field
        label="Your CAD's API address"
        hint="The same as NEXT_PUBLIC_PROD_ORIGIN in your CAD's .env, e.g. https://cad-api.yourcommunity.com/v1"
        value={address}
        onChangeText={(text) => {
          setAddress(text);
          setFound(null);
        }}
        placeholder="https://cad-api.yourcommunity.com/v1"
        autoCapitalize="none"
        keyboardType="url"
        textContentType="URL"
        returnKeyType="go"
        onSubmitEditing={() => void check()}
      />
      <ErrorBanner message={error} />

      {found ? (
        <Card>
          <CommunityBadge name={found.name} logoUrl={found.logoUrl} />
          <Body muted>Found it. Next, sign in with the owner account.</Body>
          <Button
            title="Sign in as the owner"
            onPress={() => void openCommunity(found, "start")}
          />
        </Card>
      ) : (
        <Button title="Check" loading={busy} disabled={!address.trim()} onPress={() => void check()} />
      )}
    </Screen>
  );
}

import { router } from "expo-router";
import * as React from "react";
import { describeError } from "@/lib/api";
import { useSession } from "@/lib/session";
import { Body, Button, Card, CommunityBadge, ErrorBanner, Field, Screen } from "@/ui/components";

type Step = "password" | "totp" | "newPassword";

/** sign in to the open community with a CAD username and password (+ two-step code) */
export default function SignIn() {
  const { community, intent, signIn, changeTemporaryPassword, closeCommunity } = useSession();
  const [step, setStep] = React.useState<Step>("password");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [totpCode, setTotpCode] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  if (!community) return null;

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      if (step === "newPassword") {
        if (newPassword.length < 8) throw new Error("Use at least 8 characters.");
        if (newPassword !== confirmPassword) throw new Error("The passwords don't match.");
        await changeTemporaryPassword({ currentPassword: password, newPassword });
        setPassword(newPassword);
        const result = await signIn({ username, password: newPassword, totpCode });
        if (result === "needsTotp") setStep("totp");
        else if (result === "signedIn") afterSignIn();
        return;
      }

      const result = await signIn({ username, password, totpCode });
      if (result === "needsTotp") setStep("totp");
      else if (result === "needsNewPassword") setStep("newPassword");
      else afterSignIn();
    } catch (signInError) {
      setError(describeError(signInError));
    } finally {
      setBusy(false);
    }
  }

  function afterSignIn() {
    // the owner who started the community gets the code to share right away
    if (intent === "start") router.replace({ pathname: "/invite", params: { welcome: "1" } });
  }

  return (
    <Screen edges={["bottom"]}>
      <CommunityBadge name={community.name} logoUrl={community.logoUrl} />
      {intent === "start" ? (
        <Body muted>Sign in with the CAD&apos;s owner account.</Body>
      ) : (
        <Body muted>Sign in with your account on this CAD.</Body>
      )}

      {step === "newPassword" ? (
        <Card>
          <Body>Your account has a temporary password. Choose your own to continue.</Body>
          <Field
            label="New password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            textContentType="newPassword"
            autoCapitalize="none"
          />
          <Field
            label="New password again"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textContentType="newPassword"
            autoCapitalize="none"
            returnKeyType="go"
            onSubmitEditing={() => void submit()}
          />
        </Card>
      ) : (
        <>
          <Field
            label="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            textContentType="username"
            autoComplete="username"
            editable={step === "password"}
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            textContentType="password"
            autoComplete="current-password"
            editable={step === "password"}
            returnKeyType={step === "password" ? "go" : "next"}
            onSubmitEditing={() => step === "password" && void submit()}
          />
          {step === "totp" ? (
            <Field
              label="Two-step code"
              hint="The 6-digit code from your authenticator app."
              value={totpCode}
              onChangeText={(text) => setTotpCode(text.replace(/\D/g, "").slice(0, 6))}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              autoFocus
              returnKeyType="go"
              onSubmitEditing={() => void submit()}
            />
          ) : null}
        </>
      )}

      <ErrorBanner message={error} />
      <Button
        title={step === "newPassword" ? "Save and sign in" : "Sign in"}
        loading={busy}
        disabled={
          step === "newPassword"
            ? !newPassword || !confirmPassword
            : !username.trim() || !password || (step === "totp" && totpCode.length < 6)
        }
        onPress={() => void submit()}
      />
      <Button
        title="Use a different community"
        variant="secondary"
        onPress={() => void closeCommunity()}
      />
    </Screen>
  );
}

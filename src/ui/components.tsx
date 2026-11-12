import * as React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { radius, spacing, useColors } from "./theme";

/** a scrolling screen that stays clear of the notch, home bar and keyboard */
export function Screen({
  children,
  edges = ["top", "bottom"],
  scroll = true,
}: {
  children: React.ReactNode;
  edges?: ("top" | "bottom")[];
  scroll?: boolean;
}) {
  const colors = useColors();
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="automatic"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.scroll, { flex: 1 }]}>{children}</View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={edges}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Title({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
      {children}
    </Text>
  );
}

export function Body({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  const colors = useColors();
  return <Text style={[styles.body, { color: muted ? colors.muted : colors.text }]}>{children}</Text>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const colors = useColors();
  return (
    <View
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}
    >
      {children}
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
}: {
  title: string;
  onPress(): void;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  disabled?: boolean;
}) {
  const colors = useColors();
  const isDisabled = disabled || loading;
  const background =
    variant === "primary" ? colors.primary : variant === "danger" ? colors.danger : colors.card;
  const foreground = variant === "secondary" ? colors.text : colors.primaryText;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderColor: variant === "secondary" ? colors.border : background,
          opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <Text style={[styles.buttonText, { color: foreground }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  hint,
  error,
  ...props
}: TextInputProps & { label: string; hint?: string; error?: string | null }) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        autoCorrect={false}
        {...props}
        accessibilityLabel={label}
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.input,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      />
      {error ? (
        <Text style={[styles.hint, { color: colors.danger }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: colors.muted }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  const colors = useColors();
  if (!message) return null;
  return (
    <View
      accessibilityRole="alert"
      style={[styles.banner, { backgroundColor: colors.dangerBackground, borderColor: colors.danger }]}
    >
      <Text style={{ color: colors.danger, fontSize: 15 }}>{message}</Text>
    </View>
  );
}

export function CommunityBadge({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  const colors = useColors();
  return (
    <View style={styles.badge}>
      {logoUrl ? (
        <Image source={{ uri: logoUrl }} style={styles.logo} contentFit="cover" />
      ) : (
        <View style={[styles.logo, { backgroundColor: colors.primary }]}>
          <Text style={{ color: colors.primaryText, fontSize: 22, fontWeight: "700" }}>
            {name.slice(0, 1).toUpperCase()}
          </Text>
        </View>
      )}
      <Text style={[styles.badgeName, { color: colors.text }]} numberOfLines={2}>
        {name}
      </Text>
    </View>
  );
}

export function Loading() {
  const colors = useColors();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.lg, flexGrow: 1 },
  title: { fontSize: 28, fontWeight: "700" },
  body: { fontSize: 16, lineHeight: 22 },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  button: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  buttonText: { fontSize: 17, fontWeight: "600" },
  field: { gap: spacing.xs },
  label: { fontSize: 15, fontWeight: "600" },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 17,
  },
  hint: { fontSize: 13 },
  banner: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md },
  badge: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  logo: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  badgeName: { fontSize: 20, fontWeight: "700", flexShrink: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});

import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 20),
          paddingLeft: Math.max(insets.left, 20),
          paddingRight: Math.max(insets.right, 20),
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backText}>‹ 戻る</ThemedText>
        </Pressable>
        <ThemedText type="title">プロフィール</ThemedText>
      </View>

      <ThemedView style={styles.profileCard}>
        <ThemedText type="subtitle" style={styles.label}>
          名前
        </ThemedText>
        <ThemedText type="default" style={styles.value}>
          {user?.name || "未設定"}
        </ThemedText>

        <ThemedText type="subtitle" style={[styles.label, styles.labelMarginTop]}>
          メールアドレス
        </ThemedText>
        <ThemedText type="default" style={styles.value}>
          {user?.email || "未設定"}
        </ThemedText>

        <ThemedText type="subtitle" style={[styles.label, styles.labelMarginTop]}>
          ユーザーID
        </ThemedText>
        <ThemedText type="default" style={styles.value}>
          {user?.id || "N/A"}
        </ThemedText>
      </ThemedView>

      <Pressable onPress={handleLogout} style={styles.logoutButton}>
        <ThemedText style={styles.logoutButtonText}>ログアウト</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: "#007AFF",
  },
  profileCard: {
    backgroundColor: "rgba(0, 122, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  labelMarginTop: {
    marginTop: 16,
  },
  value: {
    fontSize: 16,
    opacity: 0.8,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getLoginUrl } from "@/constants/oauth";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

export default function HomeScreen() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  // グループ一覧を取得
  const { data: groupsData, isLoading: groupsLoading, refetch: refetchGroups } = trpc.groups.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    console.log("[HomeScreen] Auth state:", {
      hasUser: !!user,
      loading,
      isAuthenticated,
      user: user ? { id: user.id, openId: user.openId, name: user.name, email: user.email } : null,
    });
  }, [user, loading, isAuthenticated]);

  const handleLogin = async () => {
    try {
      console.log("[Auth] Login button clicked");
      setIsLoggingIn(true);
      const loginUrl = getLoginUrl();
      console.log("[Auth] Generated login URL:", loginUrl);

      if (Platform.OS === "web") {
        console.log("[Auth] Web platform: redirecting to OAuth in same tab...");
        window.location.href = loginUrl;
        return;
      }

      console.log("[Auth] Opening OAuth URL in browser...");
      const result = await WebBrowser.openAuthSessionAsync(loginUrl, undefined, {
        preferEphemeralSession: false,
        showInRecents: true,
      });

      console.log("[Auth] WebBrowser result:", result);
      if (result.type === "cancel") {
        console.log("[Auth] OAuth cancelled by user");
      } else if (result.type === "dismiss") {
        console.log("[Auth] OAuth dismissed");
      } else if (result.type === "success" && result.url) {
        console.log("[Auth] OAuth session successful, navigating to callback:", result.url);
        try {
          let url: URL;
          if (result.url.startsWith("exp://") || result.url.startsWith("exps://")) {
            const urlStr = result.url.replace(/^exp(s)?:\/\//, "http://");
            url = new URL(urlStr);
          } else {
            url = new URL(result.url);
          }

          const code = url.searchParams.get("code");
          const state = url.searchParams.get("state");
          const error = url.searchParams.get("error");

          console.log("[Auth] Extracted params from callback URL:", {
            code: code?.substring(0, 20) + "...",
            state: state?.substring(0, 20) + "...",
            error,
          });

          if (error) {
            console.error("[Auth] OAuth error in callback:", error);
            return;
          }

          if (code && state) {
            console.log("[Auth] Navigating to callback route with params...");
            router.push({
              pathname: "/oauth/callback" as any,
              params: { code, state },
            });
          } else {
            console.error("[Auth] Missing code or state in callback URL");
          }
        } catch (err) {
          console.error("[Auth] Failed to parse callback URL:", err, result.url);
          const codeMatch = result.url.match(/[?&]code=([^&]+)/);
          const stateMatch = result.url.match(/[?&]state=([^&]+)/);

          if (codeMatch && stateMatch) {
            const code = decodeURIComponent(codeMatch[1]);
            const state = decodeURIComponent(stateMatch[1]);
            console.log("[Auth] Fallback: extracted params via regex, navigating...");
            router.push({
              pathname: "/oauth/callback" as any,
              params: { code, state },
            });
          } else {
            console.error("[Auth] Could not extract code/state from URL");
          }
        }
      }
    } catch (error) {
      console.error("[Auth] Login error:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCreateGroup = () => {
    router.push("/create-group");
  };

  const handleGroupPress = (groupId: number) => {
    router.push({
      pathname: "/group-detail",
      params: { groupId },
    });
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!isAuthenticated) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={
          <Image
            source={require("@/assets/images/partial-react-logo.png")}
            style={styles.reactLogo}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">交換日記へようこそ</ThemedText>
        </ThemedView>
        <ThemedView style={styles.authContainer}>
          <ThemedText type="default" style={styles.authText}>
            ログインして、複数人で日記を共有しましょう
          </ThemedText>
          <Pressable
            onPress={handleLogin}
            disabled={isLoggingIn}
            style={[styles.loginButton, isLoggingIn && styles.loginButtonDisabled]}
          >
            {isLoggingIn ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.loginText}>ログイン</ThemedText>
            )}
          </Pressable>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  const groups = groupsData || [];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">交換日記</ThemedText>
        <Pressable onPress={() => router.push("/profile")} style={styles.profileButton}>
          <ThemedText style={styles.profileText}>👤</ThemedText>
        </Pressable>
      </View>

      {groupsLoading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : groups.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText type="subtitle" style={styles.emptyText}>
            グループがまだありません
          </ThemedText>
          <ThemedText type="default" style={styles.emptySubtext}>
            新しいグループを作成して、友達と日記を共有しましょう
          </ThemedText>
          <Pressable onPress={handleCreateGroup} style={styles.createButton}>
            <ThemedText style={styles.createButtonText}>+ グループを作成</ThemedText>
          </Pressable>
        </ThemedView>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.groups.id.toString()}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleGroupPress(item.groups.id)}
              style={({ pressed }) => [
                styles.groupCard,
                pressed && styles.groupCardPressed,
              ]}
            >
              <ThemedView style={styles.groupCardContent}>
                <ThemedText type="defaultSemiBold" style={styles.groupName}>
                  {item.groups.name}
                </ThemedText>
                {item.groups.description && (
                  <ThemedText type="default" style={styles.groupDescription}>
                    {item.groups.description}
                  </ThemedText>
                )}
                <ThemedText type="default" style={styles.groupMeta}>
                  メンバー: 1
                </ThemedText>
              </ThemedView>
              <ThemedText style={styles.chevron}>›</ThemedText>
            </Pressable>
          )}
          ListFooterComponent={
            <Pressable onPress={handleCreateGroup} style={styles.addGroupButton}>
              <ThemedText style={styles.addGroupButtonText}>+ グループを追加</ThemedText>
            </Pressable>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  profileButton: {
    padding: 8,
  },
  profileText: {
    fontSize: 24,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  createButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 24,
  },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  groupCardPressed: {
    opacity: 0.7,
  },
  groupCardContent: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  groupMeta: {
    fontSize: 12,
    opacity: 0.6,
  },
  chevron: {
    fontSize: 24,
    marginLeft: 12,
    opacity: 0.5,
  },
  addGroupButton: {
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  addGroupButtonText: {
    color: "#34C759",
    fontSize: 16,
    fontWeight: "600",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  authContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
  },
  authText: {
    marginBottom: 16,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    width: "100%",
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

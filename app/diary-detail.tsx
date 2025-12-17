import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { trpc } from "@/lib/trpc";

export default function DiaryDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const [eId, setEId] = useState<number | null>(null);

  useEffect(() => {
    if (entryId) {
      setEId(parseInt(entryId, 10));
    }
  }, [entryId]);

  const { data: diary, isLoading } = trpc.diaries.getById.useQuery(
    { entryId: eId || 0 },
    { enabled: eId !== null }
  );

  if (!eId || isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!diary) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>日記が見つかりません</ThemedText>
      </ThemedView>
    );
  }

  const entry = diary.diaryEntries;
  const user = diary.users;

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 20),
        },
      ]}
    >
      <View style={[styles.header, { paddingLeft: Math.max(insets.left, 20), paddingRight: Math.max(insets.right, 20) }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backText}>‹ 戻る</ThemedText>
        </Pressable>
      </View>

      <ScrollView
        style={[styles.content, { paddingLeft: Math.max(insets.left, 20), paddingRight: Math.max(insets.right, 20) }]}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.authorSection}>
          <ThemedText type="defaultSemiBold" style={styles.authorName}>
            {user.name || user.email || "匿名"}
          </ThemedText>
          <ThemedText type="default" style={styles.date}>
            {new Date(entry.createdAt).toLocaleString("ja-JP")}
          </ThemedText>
        </View>

        {entry.title && (
          <ThemedText type="title" style={styles.title}>
            {entry.title}
          </ThemedText>
        )}

        <ThemedText type="default" style={styles.diaryText}>
          {entry.content}
        </ThemedText>

        {entry.imageUrl && (
          <Image
            source={{ uri: entry.imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: "#007AFF",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  authorSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  authorName: {
    fontSize: 18,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    opacity: 0.6,
  },
  title: {
    marginBottom: 16,
  },
  diaryText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginTop: 16,
  },
});

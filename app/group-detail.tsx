import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { trpc } from "@/lib/trpc";

export default function GroupDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [gId, setGId] = useState<number | null>(null);

  useEffect(() => {
    if (groupId) {
      setGId(parseInt(groupId, 10));
    }
  }, [groupId]);

  const { data: group, isLoading: groupLoading } = trpc.groups.getById.useQuery(
    { groupId: gId || 0 },
    { enabled: gId !== null }
  );

  const { data: diaries, isLoading: diariesLoading } = trpc.diaries.listByGroup.useQuery(
    { groupId: gId || 0 },
    { enabled: gId !== null }
  );

  const handleCreateDiary = () => {
    if (gId) {
      router.push({
        pathname: "/create-diary",
        params: { groupId: gId.toString() },
      });
    }
  };

  const handleDiaryPress = (entryId: number) => {
    router.push({
      pathname: "/diary-detail",
      params: { entryId },
    });
  };

  if (!gId || groupLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  const diaryList = diaries || [];

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
        <ThemedText type="title">{group?.name || "グループ"}</ThemedText>
      </View>

      {group?.description && (
        <ThemedView style={[styles.description, { paddingLeft: Math.max(insets.left, 20), paddingRight: Math.max(insets.right, 20) }]}>
          <ThemedText type="default">{group.description}</ThemedText>
        </ThemedView>
      )}

      {diariesLoading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : diaryList.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText type="subtitle" style={styles.emptyText}>
            日記がまだありません
          </ThemedText>
          <ThemedText type="default" style={styles.emptySubtext}>
            最初の日記を投稿してみましょう
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={diaryList}
          keyExtractor={(item) => item.diaryEntries.id.toString()}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleDiaryPress(item.diaryEntries.id)}
              style={({ pressed }) => [
                styles.diaryCard,
                pressed && styles.diaryCardPressed,
              ]}
            >
              <ThemedView style={styles.diaryCardContent}>
                <View style={styles.diaryHeader}>
                  <ThemedText type="defaultSemiBold">
                    {item.users.name || item.users.email || "匿名"}
                  </ThemedText>
                  <ThemedText type="default" style={styles.diaryDate}>
                    {new Date(item.diaryEntries.createdAt).toLocaleDateString("ja-JP")}
                  </ThemedText>
                </View>
                {item.diaryEntries.title && (
                  <ThemedText type="defaultSemiBold" style={styles.diaryTitle}>
                    {item.diaryEntries.title}
                  </ThemedText>
                )}
                <ThemedText type="default" style={styles.diaryPreview} numberOfLines={3}>
                  {item.diaryEntries.content}
                </ThemedText>
              </ThemedView>
            </Pressable>
          )}
          contentContainerStyle={[styles.listContent, { paddingLeft: Math.max(insets.left, 20), paddingRight: Math.max(insets.right, 20) }]}
        />
      )}

      <Pressable
        onPress={handleCreateDiary}
        style={[styles.fab, { bottom: Math.max(insets.bottom, 20) + 16 }]}
      >
        <ThemedText style={styles.fabText}>+</ThemedText>
      </Pressable>
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
  description: {
    marginBottom: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
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
    opacity: 0.7,
  },
  listContent: {
    paddingBottom: 100,
  },
  diaryCard: {
    backgroundColor: "rgba(0, 122, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  diaryCardPressed: {
    opacity: 0.7,
  },
  diaryCardContent: {
    gap: 8,
  },
  diaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  diaryDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  diaryTitle: {
    fontSize: 16,
    marginTop: 4,
  },
  diaryPreview: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  fabText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 32,
  },
});

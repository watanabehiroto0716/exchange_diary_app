import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { trpc } from "@/lib/trpc";

export default function CreateDiaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [gId, setGId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (groupId) {
      setGId(parseInt(groupId, 10));
    }
  }, [groupId]);

  const createMutation = trpc.diaries.create.useMutation({
    onSuccess: () => {
      router.back();
    },
  });

  const handleCreate = async () => {
    if (!content.trim()) {
      alert("日記の内容を入力してください");
      return;
    }

    if (!gId) {
      alert("グループが見つかりません");
      return;
    }

    setIsLoading(true);
    try {
      await createMutation.mutateAsync({
        groupId: gId,
        title: title.trim() || undefined,
        content: content.trim(),
      });
    } catch (error) {
      console.error("Failed to create diary:", error);
      alert("日記の投稿に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (!gId) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

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
        <ThemedText type="title">日記を投稿</ThemedText>
      </View>

      <View style={styles.form}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          タイトル（オプション）
        </ThemedText>
        <TextInput
          style={styles.input}
          placeholder="タイトルを入力"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#999"
          editable={!isLoading}
        />

        <ThemedText type="defaultSemiBold" style={styles.label}>
          内容
        </ThemedText>
        <TextInput
          style={[styles.input, styles.contentInput]}
          placeholder="今日の出来事や思ったことを書いてください"
          value={content}
          onChangeText={setContent}
          placeholderTextColor="#999"
          multiline
          numberOfLines={8}
          editable={!isLoading}
        />

        <Pressable
          onPress={handleCreate}
          disabled={isLoading}
          style={[styles.createButton, isLoading && styles.createButtonDisabled]}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.createButtonText}>投稿</ThemedText>
          )}
        </Pressable>
      </View>
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
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  contentInput: {
    textAlignVertical: "top",
    minHeight: 150,
  },
  createButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    marginTop: 24,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

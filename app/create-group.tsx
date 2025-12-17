import { useRouter } from "expo-router";
import { useState } from "react";
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

export default function CreateGroupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createMutation = trpc.groups.create.useMutation({
    onSuccess: () => {
      router.back();
    },
  });

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("グループ名を入力してください");
      return;
    }

    setIsLoading(true);
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
    } catch (error) {
      console.error("Failed to create group:", error);
      alert("グループの作成に失敗しました");
    } finally {
      setIsLoading(false);
    }
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
        <ThemedText type="title">グループを作成</ThemedText>
      </View>

      <View style={styles.form}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          グループ名
        </ThemedText>
        <TextInput
          style={styles.input}
          placeholder="グループ名を入力"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#999"
          editable={!isLoading}
        />

        <ThemedText type="defaultSemiBold" style={styles.label}>
          説明（オプション）
        </ThemedText>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="グループの説明を入力"
          value={description}
          onChangeText={setDescription}
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
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
            <ThemedText style={styles.createButtonText}>作成</ThemedText>
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
  descriptionInput: {
    textAlignVertical: "top",
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

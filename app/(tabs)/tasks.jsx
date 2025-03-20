import { View, Text, ScrollView, StyleSheet } from "react-native";
import React from "react";

const Tasks = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Мои Задачи</Text>

        {/* Example Task Cards */}
        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>Задача 1</Text>
          <Text style={styles.taskDescription}>
            Описание задачи 1. Это пример текста для задачи.
          </Text>
        </View>

        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>Задача 2</Text>
          <Text style={styles.taskDescription}>
            Описание задачи 2. Это пример текста для задачи.
          </Text>
        </View>

        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>Задача 3</Text>
          <Text style={styles.taskDescription}>
            Описание задачи 3. Это пример текста для задачи.
          </Text>
        </View>

        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>Задача 3</Text>
          <Text style={styles.taskDescription}>
            Описание задачи 3. Это пример текста для задачи.
          </Text>
        </View>

        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>Задача 3</Text>
          <Text style={styles.taskDescription}>
            Описание задачи 3. Это пример текста для задачи.
          </Text>
        </View>

        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>Задача 3</Text>
          <Text style={styles.taskDescription}>
            Описание задачи 3. Это пример текста для задачи.
          </Text>
        </View>

        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>Задача 3</Text>
          <Text style={styles.taskDescription}>
            Описание задачи 3. Это пример текста для задачи.
          </Text>
        </View>

        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>Задача 3</Text>
          <Text style={styles.taskDescription}>
            Описание задачи 3. Это пример текста для задачи.
          </Text>
        </View>

        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>Задача 3</Text>
          <Text style={styles.taskDescription}>
            Описание задачи 3. Это пример текста для задачи.
          </Text>
        </View>

        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>Задача 3</Text>
          <Text style={styles.taskDescription}>
            Описание задачи 3. Это пример текста для задачи.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1F3A",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 55,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 20,
  },
  taskCard: {
    backgroundColor: "#1E2A3A",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#00FFFF",
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
  },
});

export default Tasks;

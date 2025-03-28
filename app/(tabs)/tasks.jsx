import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import TaskInfo from "../compnents/taskInfo";
import React, { useState } from "react";
import EditTaskModal from "../compnents/editTaskModal";
import { Ionicons } from "@expo/vector-icons";

const Tasks = () => {
  const [editingTask, setEditingTask] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Запланировать встречу",
      description: "С клиентом в 15:00",
      completed: false,
    },
    {
      id: 2,
      title: "Подготовить отчет",
      description: "Квартальный отчет по продажам",
      completed: false,
    },
    {
      id: 3,
      title: "Купить продукты",
      description: "Молоко, яйца, хлеб",
      completed: false,
    },
    {
      id: 4,
      title: "Сдать карточку ПП",
      description: "Как только будет 3ий человек, сдать карточку",
      completed: false,
    },
  ]);
  const [balance, setBalance] = useState(1500); // Example balance

  const markAsDone = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleEdit = (taskId) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    setEditingTask(taskToEdit);
    setIsModalVisible(true);
  };

  const handleCreateNew = () => {
    setEditingTask({
      id: Date.now(), // Temporary ID for new task
      title: "",
      description: "",
      completed: false,
    });
    setIsModalVisible(true);
  };

  const handleSave = (updatedTask) => {
    if (editingTask.id) {
      if (tasks.some((task) => task.id === editingTask.id)) {
        // Update existing task
        setTasks(
          tasks.map((task) =>
            task.id === editingTask.id ? { ...task, ...updatedTask } : task
          )
        );
      } else {
        // Add new task
        setTasks([...tasks, updatedTask]);
      }
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Мои Задачи</Text>
          <View style={styles.balanceContainer}>
            <Ionicons name="logo-bitcoin" size={20} color="#FFD700" />
            <Text style={styles.balanceText}>{balance}</Text>
          </View>
        </View>

        <View style={styles.createButtonContainer}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateNew}
          >
            <Text style={styles.plusSign}>+</Text>
          </TouchableOpacity>
          <Text style={styles.createButtonText}>Добавить задачу</Text>
        </View>

        {tasks.map((task) => (
          <TaskInfo
            key={task.id}
            title={task.title}
            description={task.description}
            completed={task.completed}
            onEdit={() => handleEdit(task.id)}
            onComplete={() => markAsDone(task.id)}
            onCancel={() => deleteTask(task.id)}
          />
        ))}
      </ScrollView>

      <EditTaskModal
        visible={isModalVisible}
        task={editingTask}
        onSave={handleSave}
        onCancel={handleCancel}
      />
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    borderBlockColor: "#FFD700",
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFD700",
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  balanceText: {
    color: "#FFD700",
    marginLeft: 5,
    fontWeight: "600",
  },
  createButton: {
    width: 50,
    height: 50,
    borderRadius: 20, // Makes it perfectly circular
    borderWidth: 4,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 20,
  },
  createButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  plusSign: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
  },
});

export default Tasks;

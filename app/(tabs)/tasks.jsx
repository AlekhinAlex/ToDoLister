import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import TaskInfo from "../compnents/taskInfo";
import React, { useState, useEffect } from "react";
import EditTaskModal from "../compnents/editTaskModal";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
    {
      id: 5,
      title: "Сдать карточку ПП",
      description: "Как только будет 3ий человек, сдать карточку",
      completed: false,
    },
    {
      id: 6,
      title: "Сдать карточку ПП",
      description: "Как только будет 3ий человек, сдать карточку",
      completed: false,
    },
    {
      id: 7,
      title: "Сдать карточку ПП",
      description: "Как только будет 3ий человек, сдать карточку",
      completed: false,
    },
    {
      id: 8,
      title: "Сдать карточку ПП",
      description: "Как только будет 3ий человек, сдать карточку",
      completed: false,
    },
  ]);
  const [balance, setBalance] = useState(1500);
  const [isCompact, setIsCompact] = useState(
    Dimensions.get("window").width < 764
  );

  useEffect(() => {
    const handleResize = ({ window }) => {
      setIsCompact(window.width < 764);
    };

    const subscription = Dimensions.addEventListener("change", handleResize);
    return () => subscription?.remove();
  }, []);

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
      id: Date.now(),
      title: "",
      description: "",
      completed: false,
    });
    setIsModalVisible(true);
  };

  const handleSave = (updatedTask) => {
    if (editingTask.id) {
      if (tasks.some((task) => task.id === editingTask.id)) {
        setTasks(
          tasks.map((task) =>
            task.id === editingTask.id ? { ...task, ...updatedTask } : task
          )
        );
      } else {
        setTasks([...tasks, updatedTask]);
      }
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <LinearGradient colors={["#4169d1", "#9ba7be"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="checkmark-done-circle" size={30} color="#fff" />
              <Text style={styles.title}>Мои Задачи</Text>
            </View>
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
              <LinearGradient
                colors={["#6a11cb", "#2575fc"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Ionicons name="add" size={26} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.createButtonText}>Добавить задачу</Text>
          </View>

          <View style={styles.tasksOuterWrapper}>
            <View
              style={[
                styles.tasksWrapper,
                { flexDirection: isCompact ? "column" : "row" },
              ]}
            >
              {tasks.map((task) => (
                <TaskInfo
                  key={task.id}
                  title={task.title}
                  description={task.description}
                  completed={task.completed}
                  onEdit={() => handleEdit(task.id)}
                  onComplete={() => markAsDone(task.id)}
                  onCancel={() => deleteTask(task.id)}
                  isCompact={isCompact}
                />
              ))}
            </View>
          </View>
          <EditTaskModal
            visible={isModalVisible}
            task={editingTask}
            onSave={handleSave}
            onCancel={handleCancel}
            isCompact={isCompact}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: "100%",
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
    fontSize: 30,
    fontWeight: "bold",
    color: "#c3dafe",
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
    borderRadius: 20,
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
  tasksWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 15,
  },
  tasksOuterWrapper: {
    alignSelf: "center",
    width: "70%",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#ffffff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  gradientButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});

export default Tasks;

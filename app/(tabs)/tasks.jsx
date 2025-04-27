import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import TaskInfo from "../compnents/taskInfo";  // Предположим, что это компонент для отображения задач
import EditTaskModal from "../compnents/editTaskModal";  // Предположим, что это компонент для редактирования задач
import { isTokenExpired, refreshAccessToken } from "./lib/authTokenManager";  // Функции для проверки и обновления токенов
import { getToken, setToken } from "./lib/storage";  // Функции для работы с токенами
import { createTask, updateTask } from "./lib/api";  // Функции для отправки задач на сервер
import { Alert } from "react-native"; // Добавь импорт
import ConfirmDeleteModal from "../compnents/confirmDeleteModal";  // путь проверь


const API_BASE = "http://127.0.0.1:8000";  // Базовый URL API

const Tasks = () => {
  const [editingTask, setEditingTask] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [gold, setBalance] = useState(0);
  const [xp, setXp] = useState(0);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [taskIdToDelete, setTaskIdToDelete] = useState(null);

  const [isCompact, setIsCompact] = useState(Dimensions.get("window").width < 764);

  useEffect(() => {
    const handleResize = ({ window }) => {
      setIsCompact(window.width < 764);
    };

    const subscription = Dimensions.addEventListener("change", handleResize);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    fetchUserTasksAndBalance();
  }, []);

  const fetchUserTasksAndBalance = async () => {
    try {
      // Получаем токены из локального хранилища
      const { access, refresh } = await getToken();

      // Проверяем, не истек ли access токен
      if (isTokenExpired(access)) {
        console.log("Access token истек, обновляем токен.");

        // Если истек, пытаемся обновить токен
        const { access: newAccess, refresh: newRefresh } = await refreshAccessToken(refresh, access);

        // Обновляем токены в локальном хранилище
        setToken({ access: newAccess, refresh: newRefresh });

        // После обновления продолжаем запрос с новым токеном
        await getUserTasksAndBalanceWithToken(newAccess);
      } else {
        await getUserTasksAndBalanceWithToken(access);
      }
    } catch (error) {
      console.error("Ошибка при получении задач и баланса:", error);
    }
  };

  const getUserTasksAndBalanceWithToken = async (accessToken) => {
    try {
      // Tasks fetch logic remains the same
      const tasksResponse = await fetch(`${API_BASE}/api/tasks/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!tasksResponse.ok) {
        throw new Error(`Ошибка при получении данных задач: ${tasksResponse.statusText}`);
      }

      const tasksData = await tasksResponse.json();
      setTasks(tasksData);

      // Character fetch logic with better error handling
      try {
        const characterResponse = await fetch(`${API_BASE}/api/character/me/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (characterResponse.status === 404) {
          // Character doesn't exist, create one
          const createResponse = await fetch(`${API_BASE}/api/character/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              name: `Hero_${Date.now()}`,
              level: 1,
              gold: 0,
              xp: 0
            }),
          });

          if (!createResponse.ok) {
            throw new Error("Failed to create character");
          }

          const newCharacter = await createResponse.json();
          setBalance(newCharacter.gold || 0);
          setXp(newCharacter.xp || 0);
        } else if (!characterResponse.ok) {
          throw new Error(`Ошибка при получении данных героя: ${characterResponse.statusText}`);
        } else {
          const characterData = await characterResponse.json();
          setBalance(characterData.gold || 0);
          setXp(characterData.xp || 0);
        }
      } catch (error) {
        console.error("Ошибка получения героя:", error.message);
      }

    } catch (error) {
      console.error("Ошибка получения задач:", error.message);
    }
  };

  const markAsDone = async (taskId) => {
    try {
      const taskToUpdate = tasks.find((task) => task.id === taskId);
      const updatedStatus = !taskToUpdate.is_completed;

      const { access } = await getToken();
      await updateTask(taskId, {
        ...taskToUpdate,
        completed: updatedStatus,
      }, access);

      const { reward_xp = 0, reward_gold = 0 } = taskToUpdate;

      if (updatedStatus) {
        // Если задача отмечена выполненной
        const characterResponse = await fetch(`${API_BASE}/api/character/me/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
        });
        const characterData = await characterResponse.json();
        const currentXp = characterData.xp || 0;
        const currentBalance = characterData.gold || 0;

        const newXp = currentXp + reward_xp;
        const newBalance = currentBalance + reward_gold;

        await fetch(`${API_BASE}/api/tasks/${taskId}/complete/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });

        setXp(newXp);
        setBalance(newBalance);
        console.log("XP и Gold добавлены:", newXp, newBalance);
      } else {
        // Если задача снята с выполнения
        const characterResponse = await fetch(`${API_BASE}/api/character/me/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
        });
        const characterData = await characterResponse.json();
        const currentXp = characterData.xp || 0;
        const currentBalance = characterData.gold || 0;

        const newXp = Math.max(currentXp - reward_xp, 0);
        const newBalance = Math.max(currentBalance - reward_gold, 0);

        await fetch(`${API_BASE}/api/tasks/${taskId}/uncomplete/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });

        setXp(newXp);
        setBalance(newBalance);
        console.log("XP и Gold вычтены:", newXp, newBalance);
      }

      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, is_completed: updatedStatus } : task
      );
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Ошибка при изменении статуса задачи:", error);
    }
  };

  const confirmDeleteTask = (taskId) => {
    setTaskIdToDelete(taskId);
    setIsConfirmModalVisible(true);
  };

  const deleteTask = async () => {
    try {
      const { access } = await getToken();
      await fetch(`${API_BASE}/api/tasks/${taskIdToDelete}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
      });

      setTasks(tasks.filter((task) => task.id !== taskIdToDelete));
      setIsConfirmModalVisible(false);
      setTaskIdToDelete(null);
    } catch (error) {
      console.error("Ошибка при удалении задачи:", error);
    }
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



  const handleSave = async (updatedTask) => {
    try {
      let token = await getToken();
      if (!token || !token.access) {
        throw new Error("Токен отсутствует");
      }

      if (isTokenExpired(token.access)) {
        if (!token.refresh || isTokenExpired(token.refresh)) {
          throw new Error("Требуется повторная авторизация");
        }

        const newTokens = await refreshAccessToken(token.refresh);
        token = {
          access: newTokens.access,
          refresh: newTokens.refresh || token.refresh,
        };
        await setToken(token);
      }

      const taskData = {
        title: updatedTask.title,
        description: updatedTask.description,
        is_completed: updatedTask.completed || false
      };

      const existingTaskIds = tasks.map(task => task.id);
      if (existingTaskIds.includes(editingTask.id)) {
        const updated = await updateTask(editingTask.id, taskData, token.access);
        setTasks(tasks.map(t => t.id === updated.id ? updated : t));
      } else {
        const createdTask = await createTask(taskData, token.access);
        setTasks([...tasks, createdTask]);
      }

      setIsModalVisible(false);
    } catch (error) {
      console.error("Ошибка при сохранении задачи:", error);
    }
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
              <Ionicons name="checkmark-done-circle" size={40} color="#fff" />
              <Text style={styles.title}>Мои Задачи</Text>
            </View>

            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <Ionicons name="cash-outline" size={20} color="#FFD700" />
                <Text style={styles.statusText}>{gold}</Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons name="school-outline" size={20} color="#FFD700" />
                <Text style={styles.statusText}>{xp}</Text>
              </View>
            </View>
          </View>


          <View style={styles.createButtonWrapper}>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateNew}>
              <LinearGradient
                colors={["#6a11cb", "#2575fc"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Ionicons name="add" size={26} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.createButtonText}>Добавить</Text>
          </View>
          {tasks.length === 0 ? (
            <View style={styles.noTasksContainer}>
              <Text style={styles.noTasksText}>Задач пока нет</Text>
            </View>
          ) : (
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
                    completed={task.is_completed}
                    onEdit={() => handleEdit(task.id)}
                    onComplete={() => markAsDone(task.id)}
                    onCancel={() => confirmDeleteTask(task.id)}
                    gold={task.reward_gold || 0}
                    xp={task.reward_xp || 0}
                    isCompact={isCompact}
                  />
                ))}
              </View>
            </View>
          )}


          <EditTaskModal
            visible={isModalVisible}
            task={editingTask}
            onSave={handleSave}
            onCancel={handleCancel}
            isCompact={isCompact}
          />

          <ConfirmDeleteModal
            visible={isConfirmModalVisible}
            onConfirm={deleteTask}
            onCancel={() => setIsConfirmModalVisible(false)}
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
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  balanceText: {
    color: "#FFD700",
    marginLeft: 5,
    fontWeight: "600",
  },
  noTasksContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    marginTop: 100,  // Центрируем по вертикали
  },
  noTasksText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 20,
  },
  createButton: {
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

  createButtonWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 25,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 22,
  },
  tasksWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
  },
  tasksOuterWrapper: {
    alignSelf: "center",
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
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  balanceText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "600",
  },
  rewardsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  rewardsText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "600",
  },
  statusContainer: {
    //flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },

  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  statusText: {
    color: "#FFD700",
    marginLeft: 6,
    fontSize: 16,
    fontWeight: "600",
  },

});

export default Tasks;
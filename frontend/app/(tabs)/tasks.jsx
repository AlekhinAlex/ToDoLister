import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import TaskInfo from "../compnents/taskInfo";
import EditTaskModal from "../compnents/editTaskModal";
import RankDisplay from "../compnents/rankModal";
import RankUpAnimation from '../compnents/rankUpAnimation';
import ConfirmDeleteModal from "../compnents/confirmDeleteModal";
import { isTokenExpired, refreshAccessToken } from "./lib/authTokenManager";
import { getToken, setToken } from "./lib/storage";
import { createTask, updateTask } from "./lib/api";
import { API_BASE } from "./lib/api";


const SortModal = ({ visible, options, selectedValue, onSelect, onClose }) => (
  <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
    <View style={modalStyles.overlay}>
      <View style={modalStyles.content}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              modalStyles.option,
              selectedValue === option.value && modalStyles.selectedOption
            ]}
            onPress={() => {
              onSelect(option.value);
              onClose();
            }}
          >
            <Text
              style={[
                modalStyles.optionText,
                selectedValue === option.value && modalStyles.selectedOptionText,
              ]}
            >
              {option.label}
            </Text>
            {selectedValue === option.value && (
              <Ionicons name="checkmark" size={16} color="#4169d1" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </Modal>
);

const Tasks = () => {
  const [editingTask, setEditingTask] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [gold, setBalance] = useState(0);
  const [xp, setXp] = useState(0);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [taskIdToDelete, setTaskIdToDelete] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isCompact, setIsCompact] = useState(Dimensions.get("window").width < 764);
  const [activeTab, setActiveTab] = useState("active");
  const [sortBy, setSortBy] = useState("default");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [deletingTasks, setDeletingTasks] = useState({});
  const [characterData, setCharacterData] = useState({
    gold: 0,
    xp: 0,
    next_rank: null,
    rank: null,
  });
  const [showRankUp, setShowRankUp] = useState(false);
  const [oldRank, setOldRank] = useState(null);
  const [newRank, setNewRank] = useState(null);

  const sortOptions = [
    { label: "По умолчанию", value: "default" },
    { label: "По дате (новые)", value: "date_new" },
    { label: "По дате (старые)", value: "date_old" },
    { label: "По сложности (легкие)", value: "difficulty_easy" },
    { label: "По сложности (сложные)", value: "difficulty_hard" },
    { label: "По типу", value: "type" },
  ];

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
      const { access, refresh } = await getToken();

      if (isTokenExpired(access)) {
        const { access: newAccess, refresh: newRefresh } = await refreshAccessToken(refresh, access);
        setToken({ access: newAccess, refresh: newRefresh });
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
      const [tasksResponse, characterResponse, ranksResponse] = await Promise.all([
        fetch(`${API_BASE}/api/tasks/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }),
        fetch(`${API_BASE}/api/character/get-character/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }),
        fetch(`${API_BASE}/api/ranks/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      ]);

      if (!tasksResponse.ok) throw new Error(`Ошибка задач: ${tasksResponse.statusText}`);
      const tasksData = await tasksResponse.json();
      setTasks(tasksData);

      if (characterResponse.ok && ranksResponse.ok) {
        const characterData = await characterResponse.json();
        const ranksData = await ranksResponse.json();

        const sortedRanks = [...ranksData].sort((a, b) => a.required_xp - b.required_xp);
        const userXP = characterData.xp || 0;

        let currentRank = null;
        let nextRank = null;

        for (let i = 0; i < sortedRanks.length; i++) {
          const rank = sortedRanks[i];
          if (userXP >= rank.required_xp) {
            currentRank = rank;
          } else if (!nextRank) {
            nextRank = rank;
          }
        }

        setCharacterData({
          gold: characterData.gold || 0,
          xp: userXP,
          rank: currentRank,
          next_rank: nextRank,
          user: characterData,
        });
      }



    } catch (error) {
      console.error("Ошибка:", error.message);
    }
  };

  const markAsDone = async (taskId) => {
    try {
      const taskToUpdate = tasks.find((task) => task.id === taskId);
      const wasCompleted = taskToUpdate.is_completed;
      const updatedStatus = !wasCompleted;
      const { access } = await getToken();

      // Обновляем задачу
      await updateTask(taskId, {
        ...taskToUpdate,
        completed: updatedStatus,
      }, access);

      // Получаем текущие данные перед обновлением
      const currentXP = characterData.xp;
      const currentGold = characterData.gold;
      const currentRank = characterData.rank;

      if (updatedStatus) {
        // Завершаем задачу (существующая логика)
        await fetch(`${API_BASE}/api/tasks/${taskId}/complete/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });

        // Вычисляем новые значения
        const newXP = currentXP + (taskToUpdate.reward_xp || 0);
        const newGold = currentGold + (taskToUpdate.reward_gold || 0);

        // Проверяем, изменился ли ранг
        const ranksResponse = await fetch(`${API_BASE}/api/ranks/`, {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });
        const ranksData = await ranksResponse.json();
        const sortedRanks = [...ranksData].sort((a, b) => a.required_xp - b.required_xp);

        let userNewRank = null;
        let userNextRank = null;

        for (let i = 0; i < sortedRanks.length; i++) {
          const rank = sortedRanks[i];
          if (newXP >= rank.required_xp) {
            userNewRank = rank;
          } else if (!userNextRank) {
            userNextRank = rank;
          }
        }

        // Если ранг изменился, запускаем анимацию
        if (userNewRank && userNewRank.id !== currentRank?.id) {
          setOldRank(currentRank);
          setNewRank(userNewRank);
          setShowRankUp(true);
        }

        // Обновляем состояние
        setCharacterData(prev => ({
          ...prev,
          xp: newXP,
          gold: newGold,
          rank: userNewRank || prev.rank,
          next_rank: userNextRank
        }));
      } else {
        // Отменяем выполнение задачи (обновленная логика)
        await fetch(`${API_BASE}/api/tasks/${taskId}/uncomplete/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });

        // Вычисляем новые значения с учетом отмены
        const newXP = Math.max(0, currentXP - (taskToUpdate.reward_xp || 0));
        const newGold = Math.max(0, currentGold - (taskToUpdate.reward_gold || 0));

        // Получаем актуальные данные о рангах
        const ranksResponse = await fetch(`${API_BASE}/api/ranks/`, {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });
        const ranksData = await ranksResponse.json();
        const sortedRanks = [...ranksData].sort((a, b) => a.required_xp - b.required_xp);

        let userNewRank = null;
        let userNextRank = null;

        for (let i = 0; i < sortedRanks.length; i++) {
          const rank = sortedRanks[i];
          if (newXP >= rank.required_xp) {
            userNewRank = rank;
          } else if (!userNextRank) {
            userNextRank = rank;
          }
        }

        // Если ранг изменился (понизился), обновляем состояние
        if (userNewRank?.id !== currentRank?.id) {
          setOldRank(currentRank);
          setNewRank(userNewRank);
          // Можно добавить анимацию понижения ранга, если нужно
        }

        // Обновляем состояние
        setCharacterData(prev => ({
          ...prev,
          xp: newXP,
          gold: newGold,
          rank: userNewRank || null,
          next_rank: userNextRank
        }));
      }

      // Обновляем статус задачи
      setTasks(tasks.map((task) =>
        task.id === taskId ? { ...task, is_completed: updatedStatus } : task
      ));
    } catch (error) {
      console.error("Ошибка при изменении статуса:", error);
    }
  };

  const confirmDeleteTask = (taskId) => {
    setTaskIdToDelete(taskId);
    const deletingTask = tasks.find((task) => task.id === taskId);
    setDeletingTask(deletingTask);
    setIsConfirmModalVisible(true);
  };

  const deleteTask = async () => {
    try {
      const { access } = await getToken();
      const task = tasks.find((t) => t.id === taskIdToDelete);

      // Помечаем задачу как удаляемую для анимации
      setDeletingTasks(prev => ({ ...prev, [taskIdToDelete]: true }));

      // Ждем завершения анимации перед фактическим удалением
      setTimeout(async () => {
        await fetch(`${API_BASE}/api/tasks/${taskIdToDelete}/delete/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
        });

        if (task && !task.is_completed) {
          setXp((prev) => Math.max(0, prev - 2 * (task.reward_xp || 0)));
          setBalance((prev) => Math.max(0, prev - 2 * (task.reward_gold || 0)));
        }

        setTasks(tasks.filter((task) => task.id !== taskIdToDelete));
        setDeletingTasks(prev => {
          const newState = { ...prev };
          delete newState[taskIdToDelete];
          return newState;
        });
      }, 800);

      setIsConfirmModalVisible(false);
      setTaskIdToDelete(null);
    } catch (error) {
      console.error("Ошибка при удалении задачи:", error);
      setDeletingTasks(prev => {
        const newState = { ...prev };
        delete newState[taskIdToDelete];
        return newState;
      });
    }
  };

  const handleEdit = (taskId) => {
    const task = tasks.find((task) => task.id === taskId);
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const handleCreateNew = () => {
    setEditingTask({ id: Date.now(), title: "", description: "", completed: false });
    setIsModalVisible(true);
  };

  const handleSave = async (updatedTask) => {
    try {
      let token = await getToken();
      if (isTokenExpired(token.access)) {
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
        difficulty: updatedTask.difficulty,
        type: updatedTask.type,
        is_completed: updatedTask.completed || false,
      };

      if (tasks.some((t) => t.id === editingTask.id)) {
        const updated = await updateTask(editingTask.id, taskData, token.access);
        setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await createTask(taskData, token.access);
        setTasks([...tasks, created]);
      }

      setIsModalVisible(false);
    } catch (error) {
      console.error("Ошибка при сохранении задачи:", error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setIsDropdownOpen(false);
  };

  const sortTasks = (tasksToSort) => {
    switch (sortBy) {
      case "date_new":
        return [...tasksToSort].sort((a, b) =>
          new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
      case "date_old":
        return [...tasksToSort].sort((a, b) =>
          new Date(a.created_at || 0) - new Date(b.created_at || 0)
        );
      case "difficulty_easy":
        return [...tasksToSort].sort((a, b) => (a.difficulty || 0) - (b.difficulty || 0));
      case "difficulty_hard":
        return [...tasksToSort].sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0));
      case "type":
        return [...tasksToSort].sort((a, b) => {
          const typeA = String(a.type || "");
          const typeB = String(b.type || "");
          return typeA.localeCompare(typeB);
        });
      default:
        return tasksToSort;
    }
  };

  const filteredTasks = sortTasks(tasks.filter((task) =>
    activeTab === "active" ? !task.is_completed : task.is_completed
  ));

  return (
    <LinearGradient colors={["#4169d1", "#9ba7be"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="checkmark-done-circle" size={50} color="#fff" />
              <Text style={styles.title}>Мои Задачи</Text>
            </View>
            <View style={styles.statusContainer}>
              {Dimensions.get("window").width >= 764 && (
                <View style={styles.statusContainer}>
                  <RankDisplay
                    xp={characterData.xp}
                    money={characterData.gold}
                    rank={characterData.rank}
                    nextRank={characterData.next_rank}
                  />
                </View>
              )}
            </View>
          </View>

          {Dimensions.get("window").width < 764 && (
            <View style={styles.statusContainerCompact}>
              <RankDisplay
                xp={characterData.xp}
                money={characterData.gold}
                rank={characterData.rank}
                nextRank={characterData.next_rank}
              />
            </View>
          )}

          <View style={styles.tabContainer}>
            <View style={styles.tabsWrapper}>
              <View
                style={[
                  styles.activeTabIndicator,
                  activeTab === "completed" && styles.activeTabIndicatorRight
                ]}
              />
              <TouchableOpacity
                onPress={() => setActiveTab("active")}
                style={styles.tab}
              >
                <Ionicons
                  name="list-outline"
                  size={20}
                  color={activeTab === "active" ? "#fff" : "rgba(255,255,255,0.7)"}
                />
                <Text style={[
                  styles.tabText,
                  activeTab === "active" && styles.activeTabText
                ]}>
                  Активные
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("completed")}
                style={styles.tab}
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={20}
                  color={activeTab === "completed" ? "#fff" : "rgba(255,255,255,0.7)"}
                />
                <Text style={[
                  styles.tabText,
                  activeTab === "completed" && styles.activeTabText
                ]}>
                  Выполненные
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {activeTab === "active" && (
            <View style={styles.actionsRow}>
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

              <View style={styles.sortContainer}>
                <TouchableOpacity
                  style={styles.sortButton}
                  onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <Ionicons name="filter" size={20} color="#fff" />
                  <Text style={styles.sortButtonText}>Сортировка</Text>
                  <Ionicons
                    name={isDropdownOpen ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#fff"
                  />
                </TouchableOpacity>
                {isDropdownOpen && (
                  <View style={{ marginTop: 5, maxWidth: isCompact ? '100%' : 300 }}>
                    <SortModal
                      visible={isDropdownOpen}
                      options={sortOptions}
                      selectedValue={sortBy}
                      onSelect={handleSortChange}
                      onClose={() => setIsDropdownOpen(false)}
                    />
                  </View>
                )}
              </View>
            </View>
          )}

          {filteredTasks.length === 0 ? (
            <View style={styles.noTasksContainer}>
              <Text style={styles.noTasksText}>Нет задач в этой категории</Text>
            </View>
          ) : (
            <View style={styles.tasksOuterWrapper}>
              <View
                style={[
                  styles.tasksWrapper,
                  { flexDirection: isCompact ? "column" : "row" },
                ]}
              >
                {filteredTasks.map((task) => (
                  <TaskInfo
                    key={task.id}
                    title={task.title}
                    description={task.description}
                    difficulty={task.difficulty}
                    type={task.type}
                    completed={task.is_completed}
                    onEdit={() => handleEdit(task.id)}
                    onComplete={() => markAsDone(task.id)}
                    onCancel={() => confirmDeleteTask(task.id)}
                    gold={task.reward_gold || 0}
                    xp={task.reward_xp || 0}
                    isCompact={isCompact}
                    isDeleting={deletingTasks[task.id]}
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
            isCompleted={deletingTask ? deletingTask.is_completed : false}
            penaltyXp={deletingTask ? 2 * deletingTask.reward_xp : 0}
            penaltyGold={deletingTask ? 2 * deletingTask.reward_gold : 0}
          />

          <RankUpAnimation
            visible={showRankUp}
            oldRank={oldRank}
            newRank={newRank}
            onComplete={() => setShowRankUp(false)}
          />

        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
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
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  createButtonWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 22,
  },
  tasksWrapper: {
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
  },
  tasksOuterWrapper: { alignSelf: "center" },
  statusContainer: { alignItems: "center", gap: 8, marginTop: 10 },
  statusContainerCompact: { alignItems: "center", gap: 8, marginTop: 10, marginBottom: 20 },
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
  noTasksContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    marginTop: 100,
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
  gradientButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
  },
  tabContainer: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  tabsWrapper: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 4,
    position: "relative",
    overflow: "hidden",
  },
  activeTabIndicator: {
    position: "absolute",
    top: 4,
    left: 4,
    width: "50%",
    height: "85%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 8,
    transitionProperty: "left",
    transitionDuration: "0.3s",
    transitionTimingFunction: "ease-out",
  },
  activeTabIndicatorRight: {
    left: "50%",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    zIndex: 1,
  },
  tabText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "700",
  },
  sortContainer: {
    position: "relative",
    zIndex: 10,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sortButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rankImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  rankText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  progressText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 5,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '80%',
    maxWidth: 320,
  },
  option: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f4ff',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    fontWeight: '600',
    color: '#4169d1',
  },
});

export default Tasks;
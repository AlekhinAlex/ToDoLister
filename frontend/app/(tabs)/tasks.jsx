import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  RefreshControl,
  TextInput
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import TaskInfo from "../compnents/taskInfo";
import EditTaskModal from "../compnents/editTaskModal";
import RankDisplay from "../compnents/rankModal";
import RankUpAnimation from '../compnents/rankUpAnimation';
import ConfirmDeleteModal from "../compnents/confirmDeleteModal";
import { isTokenExpired, refreshAccessToken } from "../lib/authTokenManager";
import CollaborationConfirmModal from '../compnents/CollaborationConfirmModal';
import { getToken, setToken } from "../lib/storage";
import { createTask, updateTask } from "../lib/api";
import { API_BASE } from "../lib/api";
import CollaborationNotifications from "../compnents/CollaborationNotifications";

const SortModal = ({ visible, options, selectedValue, onSelect, onClose }) => (
  <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
    <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={onClose}>
      <View style={modalStyles.content}>
        <Text style={modalStyles.title}>Сортировка</Text>
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
    </TouchableOpacity>
  </Modal>
);

const Tasks = () => {
  const [editingTask, setEditingTask] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
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
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [collaborationModalVisible, setCollaborationModalVisible] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(null);
  const [pendingTask, setPendingTask] = useState(null);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(task => task.is_completed).length,
    active: tasks.filter(task => !task.is_completed).length
  };

  const sortOptions = [
    { label: "По умолчанию", value: "default" },
    { label: "По дате (новые)", value: "date_new" },
    { label: "По дате (старые)", value: "date_old" },
    { label: "По сложности (легкие)", value: "difficulty_easy" },
    { label: "По сложности (сложные)", value: "difficulty_hard" },
    { label: "По типу", value: "type" },
    { label: "По награде (высокая)", value: "reward_high" },
    { label: "По награде (низкая)", value: "reward_low" },
  ];

  useEffect(() => {
    let isMounted = true;

    const handleResize = ({ window }) => {
      if (isMounted) {
        setIsCompact(window.width < 764);
      }
    };

    const subscription = Dimensions.addEventListener("change", handleResize);

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    fetchUserTasksAndBalance();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUserTasksAndBalance().then(() => {
      if (!unmounted) {
        setRefreshing(false);
      }
    });
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

        // Вычисляем новые значения с учетом отмена
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
          // Обновляем данные персонажа
          setCharacterData(prev => ({
            ...prev,
            xp: Math.max(0, prev.xp - 2 * (task.reward_xp || 0)),
            gold: Math.max(0, prev.gold - 2 * (task.reward_gold || 0)),
          }));
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

      // Подготавливаем данные для задачи (без collaborators)
      const taskData = {
        title: updatedTask.title,
        description: updatedTask.description,
        difficulty: parseInt(updatedTask.difficulty),
        type: parseInt(updatedTask.type),
        collaboration_type: parseInt(updatedTask.collaboration_type || 1),
        is_completed: updatedTask.completed || false,
      };

      let savedTask;
      if (tasks.some((t) => t.id === editingTask.id)) {
        // Обновляем существующую задачу
        savedTask = await updateTask(editingTask.id, taskData, token.access);
        setTasks(tasks.map((t) => (t.id === savedTask.id ? savedTask : t)));
      } else {
        // Создаем новую задачу
        savedTask = await createTask(taskData, token.access);
        setTasks([...tasks, savedTask]);
      }

      // Отправляем приглашения коллабораторам если они есть
      if (updatedTask.collaborators && updatedTask.collaborators.length > 0) {
        try {
          const collaboratorIds = updatedTask.collaborators.map(collab => collab.id);
          await sendCollaborationInvitations(savedTask.id, collaboratorIds);
          alert(`Приглашения отправлены ${updatedTask.collaborators.length} участникам`);
        } catch (error) {
          console.error('Ошибка отправки приглашений:', error);
          alert('Задача создана, но не удалось отправить приглашения: ' + error.message);
        }
      }

      setIsModalVisible(false);
    } catch (error) {
      console.error("Ошибка при сохранении задачи:", error);
      alert("Ошибка при сохранении задачи: " + error.message);
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
      case "reward_high":
        return [...tasksToSort].sort((a, b) => {
          const rewardA = (a.reward_gold || 0) + (a.reward_xp || 0);
          const rewardB = (b.reward_gold || 0) + (b.reward_xp || 0);
          return rewardB - rewardA;
        });
      case "reward_low":
        return [...tasksToSort].sort((a, b) => {
          const rewardA = (a.reward_gold || 0) + (a.reward_xp || 0);
          const rewardB = (b.reward_gold || 0) + (b.reward_xp || 0);
          return rewardA - rewardB;
        });
      default:
        return tasksToSort;
    }
  };

  const handleTaskUpdateWithCollaboration = async (updatedTask) => {
    if (updatedTask.collaborators && updatedTask.collaborators.length > 0) {
      // Если есть коллабораторы, отправляем запрос на подтверждение
      setPendingTask(updatedTask);
      setPendingChanges({
        title: updatedTask.title,
        description: updatedTask.description,
        difficulty: difficultyLabels[updatedTask.difficulty],
      });
      setCollaborationModalVisible(true);

      // Отправляем уведомления коллабораторам
      await sendCollaborationNotifications(updatedTask);
    } else {
      // Если нет коллабораторов, сохраняем сразу
      handleSave(updatedTask);
    }
  };

  const removeCollaborator = async (taskId, collaboratorId) => {
    try {
      const { access } = await getToken();
      const response = await fetch(
        `${API_BASE}/api/tasks/${taskId}/remove-collaborator/${collaboratorId}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${access}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to remove collaborator');
      }

      // Обновляем задачи после удаления
      fetchUserTasksAndBalance();
    } catch (error) {
      console.error('Error removing collaborator:', error);
      alert(`Ошибка при удалении участника: ${error.message}`);
    }
  };

  const sendCollaborationInvitations = async (taskId, collaboratorIds) => {
    try {
      const { access } = await getToken();

      const response = await fetch(`${API_BASE}/api/collaboration-invitations/send-invitation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access}`
        },
        body: JSON.stringify({
          task_id: taskId,
          collaborator_ids: collaboratorIds
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка отправки приглашений');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка отправки приглашений:', error);
      throw error;
    }
  };

  // Функция для обработки ответов коллабораторов
  const handleCollaborationResponse = async (response) => {
    if (response === 'accept') {
      // Сохраняем изменения
      await handleSave(pendingTask);
    }
    setCollaborationModalVisible(false);
    setPendingTask(null);
    setPendingChanges(null);
  };

  const filterTasks = (tasksToFilter) => {
    if (!searchQuery) return tasksToFilter;

    const query = searchQuery.toLowerCase();
    return tasksToFilter.filter(task =>
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query)) ||
      (task.type && task.type.toLowerCase().includes(query))
    );
  };

  const filteredTasks = filterTasks(sortTasks(tasks.filter((task) =>
    activeTab === "active" ? !task.is_completed : task.is_completed
  )));

  const toggleSearch = () => {
    if (showSearch) {
      setSearchQuery("");
    }
    setShowSearch(!showSearch);
  };

  const toggleStats = () => {
    setShowStats(!showStats);
  };

  const sendCollaborationNotifications = async (updatedTask) => {
    try {
      const { access } = await getToken();

      const collaborationCheck = await fetch(`${API_BASE}/api/check-collaboration/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access}`
        },
        body: JSON.stringify({
          task_id: updatedTask.id,
          collaborators: updatedTask.collaborators
        })
      });

      if (!collaborationCheck.ok) {
        throw new Error('Ошибка проверки коллаборации');
      }

      // Отправляем уведомления если проверка прошла успешно
      await Promise.all(
        updatedTask.collaborators.map(async (collaborator) => {
          await fetch(`${API_BASE}/api/send-collaboration-notification/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${access}`
            },
            body: JSON.stringify({
              task_id: updatedTask.id,
              collaborator_id: collaborator.id
            })
          });
        })
      );
    } catch (error) {
      console.error('Ошибка отправки уведомлений:', error);
    }
  };

  return (
    <LinearGradient colors={["#0f0c29", "#302b63", "#24243e"]} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <CollaborationNotifications />
        <View style={styles.container}>
          {/* ЗАГОЛОВОК - ИСПРАВЛЕННАЯ ВЕРСИЯ */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Ionicons name="checkmark-done-circle" size={36} color="#fff" />
                <Text style={styles.title}>Мои Задачи</Text>
              </View>
              <Text style={styles.subtitle}>
                {activeTab === "active"
                  ? `Активные задачи (${stats.active})`
                  : `Выполненные задачи (${stats.completed})`
                }
              </Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.headerButton, showSearch && styles.headerButtonActive]}
                onPress={toggleSearch}
              >
                <Ionicons
                  name={showSearch ? "close" : "search"}
                  size={22}
                  color={showSearch ? "#4169d1" : "#fff"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerButton, showStats && styles.headerButtonActive]}
                onPress={toggleStats}
              >
                <Ionicons
                  name="stats-chart"
                  size={22}
                  color={showStats ? "#4169d1" : "#fff"}
                />
              </TouchableOpacity>

              {Dimensions.get("window").width >= 764 && (
                <RankDisplay
                  xp={characterData.xp}
                  money={characterData.gold}
                  rank={characterData.rank}
                  nextRank={characterData.next_rank}
                />
              )}
            </View>
          </View>


          {/* СТАТИСТИКА - ИСПРАВЛЕННАЯ ВЕРСИЯ */}
          {showStats && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Всего задач</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, styles.statActive]}>{stats.active}</Text>
                <Text style={styles.statLabel}>Активных</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, styles.statCompleted]}>{stats.completed}</Text>
                <Text style={styles.statLabel}>Выполнено</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressText}>
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                  </Text>
                </View>
                <Text style={styles.statLabel}>Прогресс</Text>
              </View>
            </View>
          )}

          {/* РАНГ ДЛЯ МОБИЛЬНЫХ */}
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

          {/* ПЕРЕКЛЮЧАТЕЛЬ АКТИВНЫЕ/ВЫПОЛНЕННЫЕ - ИСПРАВЛЕННАЯ ВЕРСИЯ */}
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
                style={[styles.tab, activeTab === "active" && styles.tabActive]}
              >
                <Ionicons
                  name="list-outline"
                  size={20}
                  color={activeTab === "active" ? "#fff" : "rgba(255,255,255,0.7)"}
                />
                <Text style={[
                  styles.tabText,
                  activeTab === "active" && styles.tabTextActive
                ]}>
                  Активные ({stats.active})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("completed")}
                style={[styles.tab, activeTab === "completed" && styles.tabActive]}
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={20}
                  color={activeTab === "completed" ? "#fff" : "rgba(255,255,255,0.7)"}
                />
                <Text style={[
                  styles.tabText,
                  activeTab === "completed" && styles.tabTextActive
                ]}>
                  Выполненные ({stats.completed})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

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

          {filteredTasks.length === 0 ? (
            <View style={styles.noTasksContainer}>
              <Ionicons name="document-text-outline" size={60} color="rgba(255,255,255,0.3)" />
              <Text style={styles.noTasksText}>
                {searchQuery ? "Не найдено задач по вашему запросу" : "Нет задач в этой категории"}
              </Text>
              {searchQuery && (
                <TouchableOpacity
                  style={styles.clearSearchButton}
                  onPress={() => setSearchQuery("")}
                >
                  <Text style={styles.clearSearchText}>Очистить поиск</Text>
                </TouchableOpacity>
              )}
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
                    createdAt={task.created_at}
                    collaborators={task.collaborators || []}
                    ownerId={task.user}  // Передаем ID владельца (число)
                    ownerData={task.owner}  // Передаем данные владельца (объект)
                    currentUserId={characterData.user?.id}  // ID текущего пользователя
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
            onRemoveCollaborator={(collaboratorId) => {
              if (editingTask?.id) {
                removeCollaborator(editingTask.id, collaboratorId);
              }
            }}
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

          <CollaborationConfirmModal
            visible={collaborationModalVisible}
            task={pendingTask}
            changes={pendingChanges}
            onAccept={() => handleCollaborationResponse('accept')}
            onReject={() => handleCollaborationResponse('reject')}
            onCancel={() => setCollaborationModalVisible(false)}
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
    alignItems: "flex-start",
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    marginLeft: 48,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  headerButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerButtonActive: {
    backgroundColor: "rgba(65, 105, 209, 0.3)",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  statNumber: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statActive: {
    color: "#4CAF50",
  },
  statCompleted: {
    color: "#2196F3",
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  progressText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "bold",
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    textAlign: "center",
  },
  statusContainerCompact: {
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    marginBottom: 20
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
  tabContainer: {
    marginBottom: 25,
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
    backgroundColor: "rgba(65, 105, 209, 0.5)",
    borderRadius: 8,
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
  tabActive: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
  },
  tabText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  tasksWrapper: {
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
  },
  tasksOuterWrapper: {
    alignSelf: "center"
  },
  noTasksContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    marginTop: 100,
    padding: 20,
  },
  noTasksText: {
    fontSize: 22,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    marginTop: 15,
    textAlign: "center",
  },
  clearSearchButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
  },
  clearSearchText: {
    color: "#fff",
    fontSize: 14,
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
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '80%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
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
    backgroundColor: 'rgba(65, 105, 209, 0.2)',
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
  },
  selectedOptionText: {
    fontWeight: '600',
    color: '#4169d1',
  },
});

export default Tasks;
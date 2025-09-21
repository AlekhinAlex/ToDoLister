import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  useWindowDimensions,
  ScrollView,
  FlatList,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE } from "../lib/api";
import { getToken } from "../lib/storage";
import { isTokenExpired, refreshAccessToken } from "../lib/authTokenManager";

const EditTaskModal = ({
  visible,
  task,
  onSave,
  onCancel,
  collaborators = [],
  onRemoveCollaborator,
  onAddCollaborator,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState(3);
  const [type, setType] = useState(3);
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friends, setFriends] = useState([]); // Добавляем состояние для друзей
  const [loadingFriends, setLoadingFriends] = useState(false);

  const { width } = useWindowDimensions();
  const isCompact = width < 764;

  const collaborationTypeOptions = [
    { value: 1, label: 'Любой может завершить', icon: 'person' },
    { value: 2, label: 'Все должны завершить', icon: 'people' },
  ];

  const [collaborationType, setCollaborationType] = useState(1);

  useEffect(() => {
    let isMounted = true;

    if (isMounted && visible && task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setDifficulty(task.difficulty || 3);
      setType(task.type || 3);
      setCollaborationType(task.collaboration_type || 1);

      // Загружаем коллабораторов если они есть
      if (task.collaborators) {
        const acceptedCollaborators = task.collaborators
          .filter(collab => collab.accepted)
          .map(collab => collab.user);
        setSelectedFriends(acceptedCollaborators);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [visible, task?.id]);

  useEffect(() => {
    if (visible) {
      fetchFriends();
    }
  }, [visible]);

  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
      let token = await getToken();

      if (isTokenExpired(token.access)) {
        const newTokens = await refreshAccessToken(token.refresh);
        token = {
          access: newTokens.access,
          refresh: newTokens.refresh || token.refresh,
        };
      }

      const response = await fetch(`${API_BASE}/api/friendships/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.access}`,
        },
      });

      if (response.ok) {
        const friendships = await response.json();
        // Преобразуем данные о дружбах в список друзей
        const friendsList = friendships.map(friendship => friendship.friend);
        setFriends(friendsList);
      } else {
        console.error("Ошибка при загрузке друзей:", response.status);
      }
    } catch (error) {
      console.error("Ошибка при загрузке друзей:", error);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    try {
      await onRemoveCollaborator?.(collaboratorId);
      setSelectedFriends(prev => prev.filter(friend => friend.id !== collaboratorId));
    } catch (error) {
      console.error('Error removing collaborator:', error);
    }
  };

  const handleSavePress = () => {
    if (!title.trim()) {
      console.log("Название не может быть пустым");
      return;
    }

    const updatedTask = {
      ...task,
      title: title.trim(),
      description: description.trim(),
      difficulty,
      type,
      collaboration_type: collaborationType,
      completed: task?.completed || false,
      collaborators: selectedFriends,
    };

    onSave(updatedTask);
  };

  const toggleFriendSelection = (friend) => {
    const isSelected = selectedFriends.some(f => f.id === friend.id);
    if (isSelected) {
      handleRemoveCollaborator(friend.id);
    } else {
      setSelectedFriends(prev => [...prev, friend]);
    }
  };

  const difficultyOptions = [
    { value: 1, label: 'Очень легко', color: '#10B981' },
    { value: 2, label: 'Легко', color: '#22C55E' },
    { value: 3, label: 'Средне', color: '#F59E0B' },
    { value: 4, label: 'Сложно', color: '#F97316' },
    { value: 5, label: 'Очень сложно', color: '#EF4444' },
  ];

  const typeOptions = [
    { value: 1, label: 'Ежедневное', icon: 'calendar' },
    { value: 2, label: 'Еженедельное', icon: 'calendar-outline' },
    { value: 3, label: 'Постоянное', icon: 'infinite' }
  ];

  const CollaboratorsModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showCollaboratorsModal}
      onRequestClose={() => setShowCollaboratorsModal(false)}
    >
      <View style={styles.collaboratorsModalContainer}>
        <LinearGradient
          colors={["#0f0c29", "#302b63", "#24243e"]}
          style={styles.collaboratorsModalContent}
        >
          <View style={styles.collaboratorsHeader}>
            <Text style={styles.collaboratorsTitle}>Выберите друзей</Text>
            <TouchableOpacity onPress={() => setShowCollaboratorsModal(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {loadingFriends ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Загрузка друзей...</Text>
            </View>
          ) : (
            <FlatList
              data={friends}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.friendItem,
                    selectedFriends.some(f => f.id === item.id) && styles.selectedFriendItem
                  ]}
                  onPress={() => toggleFriendSelection(item)}
                >
                  <View style={styles.friendInfo}>
                    {item.avatar ? (
                      <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
                    ) : (
                      <Ionicons name="person" size={24} color="#fff" />
                    )}
                    <Text style={styles.friendName}>{item.username || item.email}</Text>
                  </View>
                  {selectedFriends.some(f => f.id === item.id) && (
                    <Ionicons name="checkmark" size={20} color="#10B981" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.noFriendsText}>
                  {loadingFriends ? "Загрузка..." : "У вас пока нет друзей"}
                </Text>
              }
            />
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onCancel}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={["#0f0c29", "#302b63", "#24243e"]}
            style={styles.gradient}
          >
            <View
              style={[
                styles.modalContent,
                { width: isCompact ? "100%" : 500, maxHeight: "100%" },
              ]}
            >
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                  <Ionicons name="create-outline" size={28} color="#fff" />
                  <Text style={styles.modalTitle}>
                    {task?.id ? "Редактировать задачу" : "Создать задачу"}
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Название задачи</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="pencil" size={20} color="#aaa" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Введите название задачи"
                      placeholderTextColor="#666"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Описание</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="document-text" size={20} color="#aaa" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.descriptionInput]}
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      placeholder="Опишите детали задачи"
                      placeholderTextColor="#666"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Сложность</Text>
                  <View style={styles.optionsContainer}>
                    {difficultyOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.optionButton,
                          difficulty === option.value && {
                            backgroundColor: option.color,
                          }
                        ]}
                        onPress={() => setDifficulty(option.value)}
                      >
                        <Text style={[
                          styles.optionButtonText,
                          difficulty === option.value && styles.selectedOptionText
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Тип задания</Text>
                  <View style={styles.optionsContainer}>
                    {typeOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.optionButton,
                          type === option.value && styles.selectedTypeOption,
                        ]}
                        onPress={() => setType(option.value)}
                      >
                        <Ionicons
                          name={option.icon}
                          size={18}
                          color={type === option.value ? "#fff" : "#aaa"}
                        />
                        <Text style={[
                          styles.optionButtonText,
                          type === option.value && styles.selectedOptionText
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Секция коллаборации */}
                <View style={styles.inputGroup}>
                  <View style={styles.collaboratorsHeader}>
                    <Text style={styles.label}>Участники задачи</Text>
                    <TouchableOpacity
                      style={styles.addCollaboratorButton}
                      onPress={() => setShowCollaboratorsModal(true)}
                    >
                      <Ionicons name="person-add" size={20} color="#3B82F6" />
                      <Text style={styles.addCollaboratorText}>Добавить</Text>
                    </TouchableOpacity>
                  </View>

                  {selectedFriends.length > 0 ? (
                    <View style={styles.collaboratorsList}>
                      {selectedFriends.map(friend => (
                        <View key={friend.id} style={styles.collaboratorItem}>
                          <View style={styles.collaboratorInfo}>
                            {friend.avatar ? (
                              <Image source={{ uri: friend.avatar }} style={styles.collaboratorAvatar} />
                            ) : (
                              <Ionicons name="person" size={16} color="#fff" />
                            )}
                            <Text style={styles.collaboratorName}>
                              {friend.username || friend.email}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleRemoveCollaborator(friend.id)}
                            style={styles.removeCollaboratorButton}
                          >
                            <Ionicons name="close" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noCollaboratorsText}>
                      Нет участников. Нажмите "Добавить" чтобы пригласить друзей.
                    </Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Тип сотрудничества</Text>
                  <View style={styles.optionsContainer}>
                    {collaborationTypeOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.optionButton,
                          collaborationType === option.value && styles.selectedTypeOption,
                        ]}
                        onPress={() => setCollaborationType(option.value)}
                      >
                        <Ionicons
                          name={option.icon}
                          size={18}
                          color={collaborationType === option.value ? "#fff" : "#aaa"}
                        />
                        <Text style={[
                          styles.optionButtonText,
                          collaborationType === option.value && styles.selectedOptionText
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onCancel}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Отмена</Text>
                  </TouchableOpacity>
                  <LinearGradient
                    colors={["#4169d1", "#3b82f6"]}
                    style={[styles.button, styles.saveButton]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <TouchableOpacity onPress={handleSavePress} style={styles.saveButtonInner}>
                      <Ionicons name="checkmark" size={20} color="#fff" />
                      <Text style={styles.buttonText}>Сохранить</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </ScrollView>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      <CollaboratorsModal />
    </>
  );
};


const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",

  },
  gradient: {
    borderRadius: 20,
    overflow: "hidden",
  },
  modalContent: {
    backgroundColor: "rgba(30, 30, 46, 0.95)",
    borderRadius: 20,
    padding: 20,
    maxHeight: "60%",
  },
  scrollContent: {
    padding: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    gap: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E0F2FE",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 15,
    outlineStyle: "none",
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 100,
    flex: 1,
    minWidth: "30%",
  },
  selectedTypeOption: {
    backgroundColor: "#4169d1",
  },
  selectedOptionText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  optionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
    marginTop: 10,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 12,
    minHeight: 50,
  },
  cancelButton: {
    backgroundColor: "rgba(239, 68, 68, 0.3)",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  saveButton: {
    overflow: "hidden",
  },
  saveButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    height: "100%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  collaboratorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addCollaboratorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  addCollaboratorText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  collaboratorsList: {
    gap: 8,
  },
  collaboratorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  collaboratorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  collaboratorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  collaboratorName: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  removeCollaboratorButton: {
    padding: 4,
  },
  noCollaboratorsText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },

  // Стили для модального окна выбора друзей
  collaboratorsModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  collaboratorsModalContent: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
  },
  collaboratorsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedFriendItem: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  friendAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  friendName: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  noFriendsText: {
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },

});

export default EditTaskModal;
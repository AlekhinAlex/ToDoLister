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
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
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
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  const { width, height } = useWindowDimensions();
  const isPhone = width < 768;
  const isLargeScreen = width >= 1200;

  // Адаптивные размеры
  const responsive = {
    fontSize: {
      title: isPhone ? 22 : 26,
      label: isPhone ? 15 : 16,
      button: isPhone ? 15 : 16,
      input: isPhone ? 15 : 16,
    },
    spacing: {
      container: isPhone ? 16 : 24,
      inputGroup: isPhone ? 18 : 22,
      element: isPhone ? 12 : 16,
      small: isPhone ? 8 : 10,
    },
    sizes: {
      modalWidth: Math.min(width * 0.92, 600),
      modalMaxHeight: height * 0.85,
      buttonHeight: isPhone ? 48 : 52,
      avatar: isPhone ? 28 : 32,
      icon: isPhone ? 18 : 20,
    },
    borderRadius: {
      modal: isPhone ? 20 : 24,
      element: isPhone ? 14 : 16,
      button: isPhone ? 14 : 16,
    }
  };

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
      animationType={isPhone ? "slide" : "fade"}
      transparent={true}
      visible={showCollaboratorsModal}
      onRequestClose={() => setShowCollaboratorsModal(false)}
    >
      <View style={styles.collaboratorsModalContainer}>
        <TouchableWithoutFeedback onPress={() => setShowCollaboratorsModal(false)}>
          <View style={styles.collaboratorsModalOverlay} />
        </TouchableWithoutFeedback>

        <View style={[
          styles.collaboratorsModalContent,
          {
            width: responsive.sizes.modalWidth,
            maxHeight: responsive.sizes.modalMaxHeight,
            borderRadius: responsive.borderRadius.modal,
            padding: responsive.spacing.container
          }
        ]}>
          <View style={styles.collaboratorsHeader}>
            <Text style={[styles.collaboratorsTitle, { fontSize: responsive.fontSize.title }]}>
              Выберите друзей
            </Text>
            <TouchableOpacity
              onPress={() => setShowCollaboratorsModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={responsive.sizes.icon} color="#fff" />
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
                      <Image
                        source={{ uri: item.avatar }}
                        style={[
                          styles.friendAvatar,
                          { width: responsive.sizes.avatar, height: responsive.sizes.avatar }
                        ]}
                      />
                    ) : (
                      <View style={[
                        styles.friendAvatarPlaceholder,
                        { width: responsive.sizes.avatar, height: responsive.sizes.avatar }
                      ]}>
                        <Ionicons name="person" size={responsive.sizes.icon - 4} color="#fff" />
                      </View>
                    )}
                    <Text style={[
                      styles.friendName,
                      { fontSize: responsive.fontSize.input }
                    ]}>
                      {item.username || item.email}
                    </Text>
                  </View>
                  {selectedFriends.some(f => f.id === item.id) && (
                    <Ionicons name="checkmark" size={responsive.sizes.icon} color="#10B981" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.noFriendsContainer}>
                  <Ionicons name="people-outline" size={40} color="#666" />
                  <Text style={styles.noFriendsText}>
                    {loadingFriends ? "Загрузка..." : "У вас пока нет друзей"}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <Modal
        animationType={"fade"}
        transparent={true}
        visible={visible}
        onRequestClose={onCancel}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <TouchableWithoutFeedback
            onPress={(e) => {
              const isTextInput = e.target?.type === 'text' ||
                e.target?.type === 'textarea' ||
                e.target?.getAttribute('data-textinput') === 'true';

              if (!isTextInput) {
                Keyboard.dismiss();
              }
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalOverlay} />

              <View style={[
                styles.modalContent,
                {
                  width: responsive.sizes.modalWidth,
                  maxHeight: responsive.sizes.modalMaxHeight,
                  borderRadius: responsive.borderRadius.modal,
                  padding: responsive.spacing.container
                }
              ]}>
                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={[styles.header, { marginBottom: responsive.spacing.inputGroup }]}>
                    <Ionicons name="create-outline" size={responsive.fontSize.title} color="#fff" />
                    <Text style={[styles.modalTitle, { fontSize: responsive.fontSize.title }]}>
                      {task?.id ? "Редактировать задачу" : "Создать задачу"}
                    </Text>
                  </View>

                  <View style={[styles.inputGroup, { marginBottom: responsive.spacing.inputGroup }]}>
                    <Text style={[styles.label, { fontSize: responsive.fontSize.label }]}>
                      Название задачи
                    </Text>
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="pencil"
                        size={responsive.sizes.icon}
                        color="#aaa"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, { fontSize: responsive.fontSize.input }]}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Введите название задачи"
                        placeholderTextColor="#666"
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { marginBottom: responsive.spacing.inputGroup }]}>
                    <Text style={[styles.label, { fontSize: responsive.fontSize.label }]}>
                      Описание
                    </Text>
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="document-text"
                        size={responsive.sizes.icon}
                        color="#aaa"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[
                          styles.input,
                          styles.descriptionInput,
                          { fontSize: responsive.fontSize.input }
                        ]}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        placeholder="Опишите детали задачи"
                        placeholderTextColor="#666"
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { marginBottom: responsive.spacing.inputGroup }]}>
                    <Text style={[styles.label, { fontSize: responsive.fontSize.label }]}>
                      Сложность
                    </Text>
                    <View style={[
                      styles.optionsContainer,
                      isPhone && styles.phoneOptionsContainer
                    ]}>
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
                            { fontSize: responsive.fontSize.input - 1 },
                            difficulty === option.value && styles.selectedOptionText
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { marginBottom: responsive.spacing.inputGroup }]}>
                    <Text style={[styles.label, { fontSize: responsive.fontSize.label }]}>
                      Тип задания
                    </Text>
                    <View style={[
                      styles.optionsContainer,
                      isPhone && styles.phoneOptionsContainer
                    ]}>
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
                            size={responsive.sizes.icon - 2}
                            color={type === option.value ? "#fff" : "#aaa"}
                          />
                          <Text style={[
                            styles.optionButtonText,
                            { fontSize: responsive.fontSize.input - 1 },
                            type === option.value && styles.selectedOptionText
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Секция коллаборации */}
                  <View style={[styles.inputGroup, { marginBottom: responsive.spacing.inputGroup }]}>
                    <View style={styles.collaboratorsHeader}>
                      <Text style={[styles.label, { fontSize: responsive.fontSize.label }]}>
                        Участники задачи
                      </Text>
                      <TouchableOpacity
                        style={styles.addCollaboratorButton}
                        onPress={() => setShowCollaboratorsModal(true)}
                      >
                        <Ionicons name="person-add" size={responsive.sizes.icon} color="#3B82F6" />
                        <Text style={[
                          styles.addCollaboratorText,
                          { fontSize: responsive.fontSize.input - 1 }
                        ]}>
                          Добавить
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {selectedFriends.length > 0 ? (
                      <View style={styles.collaboratorsList}>
                        {selectedFriends.map(friend => (
                          <View key={friend.id} style={styles.collaboratorItem}>
                            <View style={styles.collaboratorInfo}>
                              {friend.avatar ? (
                                <Image
                                  source={{ uri: friend.avatar }}
                                  style={[
                                    styles.collaboratorAvatar,
                                    { width: responsive.sizes.avatar - 4, height: responsive.sizes.avatar - 4 }
                                  ]}
                                />
                              ) : (
                                <View style={[
                                  styles.collaboratorAvatarPlaceholder,
                                  { width: responsive.sizes.avatar - 4, height: responsive.sizes.avatar - 4 }
                                ]}>
                                  <Ionicons name="person" size={responsive.sizes.icon - 6} color="#fff" />
                                </View>
                              )}
                              <Text style={[
                                styles.collaboratorName,
                                { fontSize: responsive.fontSize.input - 1 }
                              ]}>
                                {friend.username || friend.email}
                              </Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => handleRemoveCollaborator(friend.id)}
                              style={styles.removeCollaboratorButton}
                            >
                              <Ionicons name="close" size={responsive.sizes.icon - 4} color="#EF4444" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={[
                        styles.noCollaboratorsText,
                        { fontSize: responsive.fontSize.input - 1 }
                      ]}>
                        Нет участников. Нажмите "Добавить" чтобы пригласить друзей.
                      </Text>
                    )}
                  </View>

                  <View style={[styles.inputGroup, { marginBottom: responsive.spacing.inputGroup }]}>
                    <Text style={[styles.label, { fontSize: responsive.fontSize.label }]}>
                      Тип сотрудничества
                    </Text>
                    <View style={[
                      styles.optionsContainer,
                      isPhone && styles.phoneOptionsContainer
                    ]}>
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
                            size={responsive.sizes.icon - 2}
                            color={collaborationType === option.value ? "#fff" : "#aaa"}
                          />
                          <Text style={[
                            styles.optionButtonText,
                            { fontSize: responsive.fontSize.input - 1 },
                            collaborationType === option.value && styles.selectedOptionText
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={[
                    styles.buttonRow,
                    isPhone && styles.phoneButtonRow,
                    { marginTop: responsive.spacing.inputGroup, gap: responsive.spacing.element }
                  ]}>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        styles.cancelButton,
                        { height: responsive.sizes.buttonHeight, borderRadius: responsive.borderRadius.button }
                      ]}
                      onPress={onCancel}
                    >
                      <Ionicons name="close" size={responsive.sizes.icon} color="#fff" />
                      <Text style={[
                        styles.buttonText,
                        { fontSize: responsive.fontSize.button }
                      ]}>
                        Отмена
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.button,
                        styles.saveButton,
                        { height: responsive.sizes.buttonHeight, borderRadius: responsive.borderRadius.button }
                      ]}
                      onPress={handleSavePress}
                    >
                      <LinearGradient
                        colors={["#4169d1", "#3b82f6"]}
                        style={[styles.saveButtonInner, { borderRadius: responsive.borderRadius.button }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Ionicons name="checkmark" size={responsive.sizes.icon} color="#fff" />
                        <Text style={[
                          styles.buttonText,
                          { fontSize: responsive.fontSize.button }
                        ]}>
                          Сохранить
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    backgroundColor: "rgba(30, 30, 46, 0.95)",
    overflow: "hidden",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    fontWeight: "700",
    color: "#ffffff",
  },
  inputGroup: {
    width: '100%',
  },
  label: {
    fontWeight: "600",
    color: "#E0F2FE",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    outlineStyle: "none",
    flex: 1,
    color: "#FFFFFF",
    paddingVertical: 16,
  },
  descriptionInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  phoneOptionsContainer: {
    justifyContent: "space-between",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 2,
    borderColor: "transparent",
    flex: 1,
    minWidth: '30%',
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
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  phoneButtonRow: {
    flexDirection: "column",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    overflow: "hidden",
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
    gap: 10,
    width: "100%",
    height: "100%",
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  collaboratorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addCollaboratorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  addCollaboratorText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  collaboratorsList: {
    gap: 10,
  },
  collaboratorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  collaboratorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  collaboratorAvatar: {
    borderRadius: 12,
  },
  collaboratorAvatarPlaceholder: {
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collaboratorName: {
    color: '#FFFFFF',
    fontWeight: "500",
  },
  removeCollaboratorButton: {
    padding: 6,
  },
  noCollaboratorsText: {
    color: '#666',
    textAlign: 'center',
    padding: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },

  // Стили для модального окна выбора друзей
  collaboratorsModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collaboratorsModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  collaboratorsModalContent: {
    backgroundColor: "rgba(30, 30, 46, 0.95)",
    overflow: "hidden",
  },
  closeButton: {
    padding: 6,
  },
  collaboratorsTitle: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
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
    gap: 14,
  },
  friendAvatar: {
    borderRadius: 16,
  },
  friendAvatarPlaceholder: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendName: {
    color: '#FFFFFF',
    fontWeight: "500",
  },
  noFriendsContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noFriendsText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
  },
});

export default EditTaskModal;
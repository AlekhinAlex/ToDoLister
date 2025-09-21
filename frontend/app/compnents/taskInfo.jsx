import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

const difficultyLabels = {
  1: "Очень легко",
  2: "Легко",
  3: "Средне",
  4: "Сложно",
  5: "Очень сложно",
};

const difficultyColors = {
  1: "#10B981", // зеленый
  2: "#22C55E", // светло-зеленый
  3: "#F59E0B", // оранжевый
  4: "#F97316", // темно-оранжевый
  5: "#EF4444", // красный
};

const taskTypeLabels = {
  1: "Ежедневное",
  2: "Еженедельное",
  3: "Постоянное",
};

const taskTypeIcons = {
  1: "calendar",
  2: "calendar-outline",
  3: "infinite",
};

const TaskInfo = ({
  title,
  description,
  completed,
  onEdit,
  onComplete,
  onCancel,
  gold = 0,
  xp = 0,
  difficulty = 3,
  type = 1,
  isDeleting = false,
  collaborators = [],
  onCollaboratorAction,
  isCollaborationPending = false,
  ownerId,
  currentUserId,
  ownerData,
  createdAt,
}) => {
  const [isCompact, setIsCompact] = useState(Dimensions.get("window").width < 764);
  const [animationType, setAnimationType] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const handleResize = ({ window }) => {
      setIsCompact(window.width < 764);
    };

    const subscription = Dimensions.addEventListener("change", handleResize);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (isDeleting) {
      setAnimationType(completed ? "delete" : "cancel");
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
      });
    }
  }, [isDeleting, completed]);

  const handleComplete = () => {
    if (completed) {
      setAnimationType("restore");
      setTimeout(() => {
        onComplete();
        setAnimationType(null);
      }, 800);
      return;
    }

    setAnimationType("complete");
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 800);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwner = String(currentUserId) === String(ownerId);
  const hasCollaborators = collaborators && collaborators.length > 0;

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.taskCard,
        completed && styles.completedCard,
        !isCompact && styles.webContainer,
        { opacity: fadeAnim },
      ]}
    >
      {/* Glass эффект */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glassBackground}
      />

      {/* Индикатор выполнения */}
      {completed && (
        <View style={styles.completedIndicator}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.completedLabel}>Выполнено</Text>
        </View>
      )}

      {/* Индикатор ожидания коллаборации */}
      {isCollaborationPending && (
        <View style={styles.collaborationPendingIndicator}>
          <Ionicons name="time" size={14} color="#F59E0B" />
          <Text style={styles.collaborationPendingLabel}>Ожидание подтверждения</Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Заголовок и описание */}
        <View style={styles.header}>
          <Text style={[styles.taskTitle, completed && styles.completedText]}>
            {title}
          </Text>
          {description && (
            <Text style={[styles.taskDescription, completed && styles.completedText]}>
              {description}
            </Text>
          )}
        </View>

        {/* Информация о владельце и дате создания - показываем только если есть участники */}
        {hasCollaborators && (
          <View style={styles.metaInfo}>
            <View style={styles.ownerInfo}>
              <Ionicons name="person" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.ownerText}>
                {isOwner ? 'Я' : `Создал: ${ownerData?.username || 'Неизвестный пользователь'}`}
              </Text>
            </View>
            {createdAt && (
              <View style={styles.dateInfo}>
                <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.dateText}>{formatDate(createdAt)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Участники коллаборации */}
        {hasCollaborators && (
          <View style={styles.collaboratorsSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people" size={16} color="#3B82F6" />
              <Text style={styles.sectionLabel}>Участники:</Text>
            </View>
            <View style={styles.collaboratorsList}>
              {collaborators.map((collaborator, index) => {
                const isCurrentUser = String(collaborator.user?.id) === String(currentUserId);
                return (
                  <LinearGradient
                    key={collaborator.id || index}
                    colors={collaborator.accepted ?
                      ['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.1)'] :
                      ['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.1)']}
                    style={[
                      styles.collaboratorBadge,
                      !collaborator.accepted && styles.pendingCollaborator
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {collaborator.user?.avatar ? (
                      <Image
                        source={{ uri: collaborator.user.avatar }}
                        style={styles.collaboratorAvatar}
                      />
                    ) : (
                      <Ionicons name="person" size={12} color="#fff" />
                    )}
                    <Text style={styles.collaboratorName}>
                      {isCurrentUser ? 'Я' : collaborator.user?.username || collaborator.user?.email}
                      {!collaborator.accepted && ' ⏳'}
                      {collaborator.completed && ' ✓'}
                    </Text>
                  </LinearGradient>
                );
              })}
            </View>
          </View>
        )}

        {/* Бейджи сложности и типа */}
        <View style={styles.badgesContainer}>
          <LinearGradient
            colors={[difficultyColors[difficulty], `${difficultyColors[difficulty]}80`]}
            style={[styles.difficultyBadge]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="speedometer" size={14} color="#fff" />
            <Text style={styles.badgeText}>{difficultyLabels[difficulty]}</Text>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)']}
            style={styles.typeBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={taskTypeIcons[type]} size={14} color="#3B82F6" />
            <Text style={[styles.badgeText, styles.typeBadgeText]}>
              {taskTypeLabels[type]}
            </Text>
          </LinearGradient>
        </View>

        {/* Награды */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
          style={styles.rewardsContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.rewardItem}>
            <LinearGradient
              colors={['#FFD700', '#FFED4E']}
              style={styles.rewardIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="cash" size={16} color="#000" />
            </LinearGradient>
            <Text style={styles.rewardText}>+{gold}</Text>
          </View>
          <View style={styles.rewardItem}>
            <LinearGradient
              colors={['#3B82F6', '#60A5FA']}
              style={styles.rewardIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="star" size={16} color="#fff" />
            </LinearGradient>
            <Text style={styles.rewardText}>+{xp}</Text>
          </View>
        </LinearGradient>

        {/* Кнопки действий - показываем только владельцу */}
        {isOwner && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={onEdit}
              disabled={isCollaborationPending}
            >
              <LinearGradient
                colors={['rgba(59, 130, 246, 0.4)', 'rgba(59, 130, 246, 0.2)']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="create-outline" size={16} color="#3B82F6" />
                <Text style={[styles.buttonText, styles.editButtonText]}>
                  Редактировать
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                disabled={isCollaborationPending}
              >
                <LinearGradient
                  colors={['rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.2)']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons
                    name={completed ? "trash-outline" : "close-outline"}
                    size={16}
                    color="#EF4444"
                  />
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>
                    {completed ? "Удалить" : "Отменить"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, completed ? styles.restoreButton : styles.doneButton]}
                onPress={handleComplete}
                disabled={isCollaborationPending}
              >
                <LinearGradient
                  colors={completed ?
                    ['rgba(59, 130, 246, 0.4)', 'rgba(59, 130, 246, 0.2)'] :
                    ['rgba(16, 185, 129, 0.4)', 'rgba(16, 185, 129, 0.2)']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons
                    name={completed ? "refresh-outline" : "checkmark-outline"}
                    size={16}
                    color={completed ? "#3B82F6" : "#10B981"}
                  />
                  <Text
                    style={[
                      styles.buttonText,
                      completed ? styles.restoreButtonText : styles.doneButtonText
                    ]}
                  >
                    {completed ? "Возобновить" : "Выполнено"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Кнопки для коллаборации (для участников) */}
        {!isOwner && onCollaboratorAction && (
          <View style={styles.collaborationActions}>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={() => onCollaboratorAction('accept')}
            >
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.4)', 'rgba(16, 185, 129, 0.2)']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="checkmark" size={16} color="#10B981" />
                <Text style={[styles.buttonText, styles.acceptButtonText]}>
                  Принять изменения
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => onCollaboratorAction('reject')}
            >
              <LinearGradient
                colors={['rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.2)']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="close" size={16} color="#EF4444" />
                <Text style={[styles.buttonText, styles.rejectButtonText]}>
                  Отклонить
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    borderRadius: 24,
    marginVertical: 12,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(30, 30, 46, 0.7)',
  },
  glassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  completedCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#10B981",
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    alignSelf: 'flex-end',
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  completedLabel: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: 22,
  },
  header: {
    marginBottom: 18,
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  taskDescription: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 24,
  },
  completedText: {
    opacity: 0.7,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownerText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.75)",
    fontWeight: "500",
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.65)",
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  difficultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.35)",
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  typeBadgeText: {
    color: "#3B82F6",
  },
  rewardsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 28,
    marginBottom: 22,
    paddingVertical: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rewardIcon: {
    padding: 7,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
  },
  rewardText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  actionsContainer: {
    gap: 16,
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  editButton: {
    borderColor: "rgba(59, 130, 246, 0.45)",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    borderColor: "rgba(239, 68, 68, 0.45)",
  },
  doneButton: {
    flex: 1,
    borderColor: "rgba(16, 185, 129, 0.45)",
  },
  restoreButton: {
    flex: 1,
    borderColor: "rgba(59, 130, 246, 0.45)",
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  editButtonText: {
    color: "#3B82F6",
  },
  cancelButtonText: {
    color: "#EF4444",
  },
  doneButtonText: {
    color: "#10B981",
  },
  restoreButtonText: {
    color: "#3B82F6",
  },
  webContainer: {
    width: 400,
  },
  collaborationPendingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    alignSelf: 'flex-start',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  collaborationPendingLabel: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "600",
  },
  collaboratorsSection: {
    marginBottom: 18,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E0F2FE",
  },
  collaboratorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  collaboratorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
  },
  collaboratorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  pendingCollaborator: {
    borderColor: 'rgba(245, 158, 11, 0.45)',
  },
  collaboratorName: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  collaborationActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  acceptButton: {
    flex: 1,
    borderColor: "rgba(16, 185, 129, 0.45)",
  },
  rejectButton: {
    flex: 1,
    borderColor: "rgba(239, 68, 68, 0.45)",
  },
  acceptButtonText: {
    color: "#10B981",
  },
  rejectButtonText: {
    color: "#EF4444",
  },
});

export default TaskInfo;
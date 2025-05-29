import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

const difficultyLabels = {
  1: 'Очень легко',
  2: 'Легко',
  3: 'Средне',
  4: 'Сложно',
  5: 'Очень сложно',
};

const difficultyColors = {
  1: '#4ADE80',
  2: '#22D3EE',
  3: '#60A5FA',
  4: '#F59E0B',
  5: '#F87171',
};

const taskTypeLabels = {
  1: 'Ежедневное',
  2: 'Еженедельное',
  3: 'Постоянное',
};

const taskTypeColors = {
  1: '#5DC59C',
  2: '#3474DC',
  3: '#E4A522',
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
}) => {
  const [isCompact, setIsCompact] = useState(Dimensions.get("window").width < 764);
  const [animationType, setAnimationType] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleResize = ({ window }) => {
      setIsCompact(window.width < 764);
    };

    const subscription = Dimensions.addEventListener("change", handleResize);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (isDeleting) {
      setAnimationType(completed ? 'delete' : 'cancel');
      setTimeout(() => {
        setIsVisible(false);
      }, 800);
    }
  }, [isDeleting, completed]);

  const handleComplete = () => {
    if (completed) {
      setAnimationType('restore');
      setTimeout(() => {
        onComplete();
        setAnimationType(null);
      }, 800);
      return;
    }

    setAnimationType('complete');
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 800);
  };

  if (!isVisible) return null;

  return (
    <View
      style={[
        styles.taskCard,
        completed && styles.completedCard,
        !isCompact && styles.webContainer,
        animationType === 'complete' && styles.completeAnimation,
        animationType === 'restore' && styles.restoreAnimation,
        animationType === 'cancel' && styles.cancelAnimation,
        animationType === 'delete' && styles.deleteAnimation,
      ]}
    >
      {animationType === 'complete' && (
        <View style={styles.animationOverlay}>
          <Ionicons name="checkmark-circle" size={100} color="#34D399" style={styles.animationIcon} />
        </View>
      )}

      {animationType === 'restore' && (
        <View style={styles.animationOverlay}>
          <Ionicons name="refresh-circle" size={100} color="#3B82F6" style={styles.animationIcon} />
        </View>
      )}

      {animationType === 'cancel' && (
        <View style={styles.animationOverlay}>
          <Ionicons name="close-circle" size={100} color="#F59E0B" style={styles.animationIcon} />
        </View>
      )}

      {animationType === 'delete' && (
        <View style={styles.animationOverlay}>
          <Ionicons name="trash-bin" size={100} color="#EF4444" style={styles.animationIcon} />
        </View>
      )}

      <View style={[!isCompact && styles.webContent, animationType && { opacity: 0.3 }]}>
        <View style={{ opacity: completed ? 0.6 : 1 }}>
          <View style={styles.textContainer}>
            <Text style={[styles.taskTitle, completed && styles.completedText]}>
              {title}
            </Text>
            {description && (
              <Text style={[styles.taskDescription, completed && styles.completedText]}>
                {description}
              </Text>
            )}
            <View style={styles.difficultyContainer}>
              <View style={[styles.difficultyBadge, { backgroundColor: difficultyColors[difficulty] }]}>
                <Text style={[styles.difficultyText, { color: 'white' }]}>
                  {difficultyLabels[difficulty]}
                </Text>
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: taskTypeColors[type] }, styles.typeBadge]}>
                <Text style={[styles.difficultyText, { color: 'white' }]}>
                  {taskTypeLabels[type]}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={onEdit}
            disabled={!!animationType}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="create-outline" size={18} color="white" />
              <Text style={styles.editButtonText}>Редактировать</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.actionButtons, !isCompact && styles.webActionButtons]}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={!!animationType}
          >
            <View style={styles.buttonContent}>
              <Ionicons
                name={completed ? "trash-outline" : "close-outline"}
                size={18}
                color="white"
              />
              <Text style={styles.buttonText}>
                {completed ? "Удалить" : "Отменить"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.doneButton]}
            onPress={handleComplete}
            disabled={!!animationType}
          >
            {completed ? (
              <View style={styles.buttonContent}>
                <Ionicons name="refresh-outline" size={18} color="white" />
                <Text style={styles.buttonText}>Возобновить</Text>
              </View>
            ) : (
              <View style={{ alignItems: "center" }}>
                <View style={styles.buttonContent}>
                  <Ionicons name="checkmark-outline" size={18} color="white" />
                  <Text style={styles.buttonText}>Выполнено</Text>
                </View>
                <View style={styles.rewardContainer}>
                  <View style={styles.rewardItem}>
                    <Ionicons name="cash-outline" size={18} color="#FFD700" />
                    <Text style={styles.rewardText}>+{gold}</Text>
                  </View>
                  <View style={styles.rewardItem}>
                    <Ionicons name="school-outline" size={18} color="#FFD700" />
                    <Text style={styles.rewardText}>+{xp}</Text>
                  </View>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    width: "90vw",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    backdropFilter: "blur(10px)",
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    transition: "all 0.5s ease",
    position: 'relative',
    overflow: 'hidden',
  },
  animationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  animationIcon: {
    opacity: 0,
    animationKeyframes: {
      '0%': { opacity: 0, transform: [{ scale: 0.5 }] },
      '30%': { opacity: 1, transform: [{ scale: 1.1 }] },
      '70%': { opacity: 1, transform: [{ scale: 1.1 }] },
      '100%': { opacity: 0, transform: [{ scale: 1.5 }] },
    },
    animationDuration: '0.8s',
    animationTimingFunction: 'ease-out',
  },
  completeAnimation: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    transform: [{ scale: 0.95 }],
  },
  restoreAnimation: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    transform: [{ scale: 0.95 }],
  },
  cancelAnimation: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    transform: [{ scale: 0.95 }],
  },
  deleteAnimation: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    transform: [{ scale: 0.95 }],
  },
  completedCard: {
    borderLeftWidth: 9,
    borderLeftColor: "#34D399",
    transition: ".3s",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#AAAAAA",
  },
  textContainer: {
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#00FFFF",
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 14,
    color: "#E0F2FE",
    opacity: 0.8,
  },
  difficultyContainer: {
    marginTop: 12,
    alignItems: "flex-start",
    flexDirection: "colomn",
    gap: 8,
  },
  difficultyBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: 'center',
  },
  actionButtons: {
    justifyContent: "space-around",
    gap: 10,
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "space-evenly",
    minHeight: 44,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#C084FC",
  },
  doneButton: {
    backgroundColor: "#34D399",
    borderWidth: 2,
    borderColor: "#56CFE1",
  },
  cancelButton: {
    backgroundColor: "#F87171",
    borderWidth: 1,
    borderColor: "#F75C03",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  editButtonText: {
    color: "#FFFFFF",
  },
  rewardText: {
    fontSize: 16,
    color: "#fff",
    marginTop: 4,
  },
  webContainer: {
    display: "flex",
    width: 320,
    minHeight: 150,
    marginRight: 15,
  },
  webContent: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  webActionButtons: {
    flexDirection: "column",
    gap: 8,
  },
  rewardContainer: {
    flexDirection: "row",
    marginTop: 6,
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});

export default TaskInfo;
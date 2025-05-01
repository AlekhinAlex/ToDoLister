import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

const TaskInfo = ({
  title,
  description,
  completed,
  onEdit,
  onComplete,
  onCancel,
  gold = 0,
  xp = 0,
}) => {
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

  return (
    <View
      style={[
        styles.taskCard,
        completed && styles.completedCard,
        !isCompact && styles.webContainer,
      ]}
    >
      <View style={[!isCompact && styles.webContent]}>

        <View style={{ opacity: completed ? 0.6 : 1 }}>
          <View style={styles.textContainer}>
            <Text style={[styles.taskTitle, completed && styles.completedText]}>
              {title}
            </Text>
            {description && (
              <Text
                style={[
                  styles.taskDescription,
                  completed && styles.completedText,
                ]}
              >
                {description}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={onEdit}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="create-outline" size={18} color="white" />
              <Text style={styles.editButtonText}>Редактировать</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.actionButtons,
            !isCompact && styles.webActionButtons,
          ]}
        >
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <View style={styles.buttonContent}>
              <Ionicons
                name={completed ? "arrow-undo-outline" : "close-outline"}
                size={18}
                color="white"
              />
              <Text style={styles.buttonText}>
                {completed ? "Убрать" : "Отказаться"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.doneButton]}
            onPress={onComplete}
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
    transition: ".3s",
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
  buttonContainer: {
    marginTop: 10,
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
  webButtonContainer: {
    flexDirection: "column",
    justifyContent: "flex-end",
    flex: 1,
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
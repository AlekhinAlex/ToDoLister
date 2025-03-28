import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";

const TaskInfo = ({
  title,
  description,
  completed,
  onEdit,
  onComplete,
  onCancel,
}) => {
  return (
    <View style={[styles.taskCard, completed && styles.completedCard]}>
      <View style={styles.textContainer}>
        <Text style={[styles.taskTitle, completed && styles.completedText]}>
          {title}
        </Text>
        {description && (
          <Text
            style={[styles.taskDescription, completed && styles.completedText]}
          >
            {description}
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={onEdit}
        >
          <Text style={styles.editButtonText}>Редактировать</Text>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.buttonText}>Отказаться</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.doneButton]}
            onPress={onComplete}
          >
            <Text style={styles.buttonText}>
              {completed ? "Возобновить" : "Выполнено"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: "#2A3A4D",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  completedCard: {
    opacity: 0.7,
    borderLeftWidth: 8,
    borderLeftColor: "#34D399",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#AAAAAA",
  },
  textContainer: {
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 18,
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
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minHeight: 44,
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
    fontSize: 14,
  },
  editButtonText: {
    color: "#FFFFFF",
  },
});

export default TaskInfo;

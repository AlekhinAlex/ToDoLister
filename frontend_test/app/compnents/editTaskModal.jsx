import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  useWindowDimensions,
} from "react-native";
import React, { useEffect, useState } from "react";

const EditTaskModal = ({
  visible,
  task,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { width } = useWindowDimensions();

  useEffect(() => {
    setTitle(task?.title || "");
    setDescription(task?.description || "");
  }, [task]);

  const handleSavePress = () => {
    if (!title.trim()) {
      console.log("Название не может быть пустым");
      return;
    }

    const updatedTask = {
      ...task,
      title: title.trim(),
      description: description.trim(),
      completed: task?.completed || false,
    };

    onSave(updatedTask);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View
          style={[
            styles.modalContent,
            { width: width < 764 ? "90%" : 500 },
          ]}
        >
          <Text style={styles.modalTitle}>
            {task?.id ? "Редактировать задачу" : "Создать задачу"}
          </Text>

          <Text style={styles.label}>Название:</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Название задачи"
            placeholderTextColor="#666"
          />

          <Text style={styles.label}>Описание:</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="Описание задачи"
            placeholderTextColor="#666"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.buttonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSavePress}
            >
              <Text style={styles.buttonText}>Сохранить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#00FFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: "#E0F2FE",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#0A1F3A",
    color: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: "#F87171",
    borderWidth: 1,
    borderColor: "#F75C03",
    flex: 1,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#34D399",
    borderWidth: 2,
    borderColor: "#56CFE1",
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default EditTaskModal;

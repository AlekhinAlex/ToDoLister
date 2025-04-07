import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const Profile = () => {
  // Initial user data with only email
  const [userData, setUserData] = useState({
    email: "ivan.ivanov@example.com",
    avatar:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/GoslingBFI081223_%2822_of_30%29_%2853388157347%29_%28cropped%29.jpg/240px-GoslingBFI081223_%2822_of_30%29_%2853388157347%29_%28cropped%29.jpg",
  });

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editableEmail, setEditableEmail] = useState(userData.email);

  const handleEditPress = () => {
    setEditableEmail(userData.email);
    setIsEditModalVisible(true);
  };

  const handleSaveChanges = () => {
    if (!editableEmail.includes("@")) {
      Alert.alert("Ошибка", "Пожалуйста, введите корректный email");
      return;
    }

    setUserData({ ...userData, email: editableEmail });
    setIsEditModalVisible(false);
    // May be later
    //Alert.alert("Успех", "Email успешно изменен");
  };

  const handleLogout = () => {
    Alert.alert("Выход", "Вы уверены, что хотите выйти?", [
      {
        text: "Отмена",
        style: "cancel",
      },
      { text: "Выйти", onPress: () => console.log("User logged out") },
    ]);
  };

  return (
    <LinearGradient colors={["#4169d1", "#9ba7be"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: userData.avatar }}
            style={styles.profileImage}
          />
        </View>

        {/* Email Information */}
        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Ionicons name="mail-outline" size={24} color="#C084FC" />
            <Text style={styles.infoText}>{userData.email}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.actionButton} onPress={handleEditPress}>
          <Text style={styles.actionButtonText}>Изменить email</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.actionButtonText}>Выйти</Text>
        </TouchableOpacity>

        {/* Edit Email Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isEditModalVisible}
          onRequestClose={() => setIsEditModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Изменить email</Text>

              <Text style={styles.inputLabel}>Новый email</Text>
              <TextInput
                style={styles.input}
                value={editableEmail}
                onChangeText={setEditableEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Введите новый email"
                placeholderTextColor="#999"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsEditModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveChanges}
                >
                  <Text style={styles.modalButtonText}>Сохранить</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 20,
  },
  gradient: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    marginBottom: 15,
  },
  infoContainer: {
    width: "100%",
    marginBottom: 30,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 30,
    padding: 15,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 10,
  },
  actionButton: {
    backgroundColor: "#C084FC",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: "#FF9A9E",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#1E2F47",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  inputLabel: {
    color: "#FFFFFF",
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#C084FC",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#FF9A9E",
  },
  saveButton: {
    backgroundColor: "#C084FC",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default Profile;

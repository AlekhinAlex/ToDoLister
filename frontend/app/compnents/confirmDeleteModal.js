import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const ConfirmDeleteModal = ({ 
  visible, 
  onConfirm, 
  onCancel, 
  isCompleted, 
  penaltyXp, 
  penaltyGold 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleConfirm = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onConfirm();
      setIsAnimating(false);
    }, 500);
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={[
          styles.modal,
          isAnimating && { transform: [{ scale: 0.95 }], opacity: 0.8 }
        ]}>
          <Text style={styles.title}>
            {isCompleted ? "Удалить задачу?" : "Отменить задачу?"}
          </Text>
          
          <Text style={styles.subtitle}>
            {isCompleted ? "Это действие нельзя будет отменить." : "Это действие приведет к штрафу."}
          </Text>

          <View style={styles.penaltyContainer}>
            {isCompleted ? (
              <Text style={styles.penaltyText}>
                После удаления задачу будет невозможно восстановить.
              </Text>
            ) : (
              <>
                <Text style={styles.penaltyText}>
                  В случае отказа ваш баланс будет уменьшен
                </Text>
                <View style={styles.penaltyDetailsContainer}>
                  {penaltyXp > 0 && (
                    <View style={styles.penaltyItem}>
                      <Ionicons name="school-outline" size={16} color="#EF4444" />
                      <Text style={styles.penaltyValue}>-{penaltyXp} XP</Text>
                    </View>
                  )}
                  {penaltyGold > 0 && (
                    <View style={styles.penaltyItem}>
                      <Ionicons name="cash-outline" size={16} color="#EF4444" />
                      <Text style={styles.penaltyValue}>-{penaltyGold} зол.</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity 
              onPress={onCancel} 
              style={styles.cancelButton}
              disabled={isAnimating}
            >
              <Text style={styles.cancelText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleConfirm}
              disabled={isAnimating}
            >
              <LinearGradient
                colors={['#ff6b6b', '#ff4d4d']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmText}>
                  {isCompleted ? "Удалить" : "Отменить"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    width: "100%",
    maxWidth: 340,
    padding: 25,
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
    transition: "all 0.3s ease",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  penaltyContainer: {
    marginBottom: 20,
    backgroundColor: "#FFF4F4",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 25,
    width: "100%",
  },
  penaltyText: {
    fontSize: 16,
    color: "#F87171",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  penaltyDetailsContainer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  penaltyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  penaltyValue: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "700",
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 100,
    alignItems: "center",
  },
  cancelText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 100,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default ConfirmDeleteModal;
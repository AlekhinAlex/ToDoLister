import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const ConfirmDeleteModal = ({ visible, onConfirm, onCancel, penaltyXp, penaltyGold, isCompleted }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Удалить задачу?</Text>
          
          {/* Условие для текста предупреждения */}
          {isCompleted ? (
            <Text style={styles.subtitle}>Это действие нельзя будет отменить.</Text>
          ) : (
            <Text style={styles.subtitle}>Это действие приведет к штрафу.</Text>
          )}

          {/* Добавление предупреждения о штрафе или невозвратности */}
          <View style={styles.penaltyContainer}>
            {isCompleted ? (
              <Text style={styles.penaltyText}>
                После удаления задачу будет невозможно восстановить.
              </Text>
            ) : (
              <Text style={styles.penaltyText}>
                В случае отказа ваш баланс будет уменьшен
              </Text>
            )}

            {/* Детали штрафа для незавершенных задач */}
            {!isCompleted && (
              <Text style={styles.penaltyDetails}>
                {penaltyXp > 0 && `-${penaltyXp} XP`}
                {penaltyGold > 0 && ` -${penaltyGold} золота`}
              </Text>
            )}
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm}>
              <LinearGradient
                colors={['#ff6b6b', '#ff4d4d']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmText}>Удалить</Text>
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
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginBottom: 25,
  },
  penaltyText: {
    fontSize: 16,
    color: "#F87171",
    fontWeight: "600",
  },
  penaltyDetails: {
    fontSize: 16,  // Увеличили размер шрифта
    color: "#FFFFFF",  // Сохраняем яркий красный цвет
    marginTop: 8,
    fontWeight: "800",  // Сделали текст более жирным
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,  // Увеличили радиус тени для более выраженного эффекта
    paddingVertical: 6,  // Немного добавили отступы для лучшего восприятия
    paddingHorizontal: 10,
    backgroundColor: "#FB5C60",  // Светлый фон, чтобы выделить текст на экране
    borderRadius: 10,  // Скруглили углы для более мягкого вида
  },

  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
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
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default ConfirmDeleteModal;

import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing
} from "react-native";
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
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [shakeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Анимация появления
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Сброс анимаций
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleConfirm = () => {
    // Анимация подтверждения
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      })
    ]).start(() => {
      onConfirm();
    });
  };

  const handleCancel = () => {
    // Анимация отмены
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ]).start(() => {
      onCancel();
    });
  };

  const shakeInterpolate = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-10, 0, 10]
  });

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: opacityAnim,
              transform: [
                { scale: scaleAnim },
                { translateX: shakeInterpolate }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={["#1a1a2e", "#16213e", "#0f3460"]}
            style={styles.modal}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Иконка */}
            <View style={styles.iconContainer}>
              <Ionicons
                name={isCompleted ? "trash-outline" : "warning-outline"}
                size={40}
                color="#FF6B6B"
              />
            </View>

            {/* Заголовок */}
            <Text style={styles.title}>
              {isCompleted ? "Удалить задачу?" : "Отменить задачу?"}
            </Text>

            {/* Подзаголовок */}
            <Text style={styles.subtitle}>
              {isCompleted
                ? "Это действие нельзя будет отменить"
                : "Внимание! Это действие приведет к штрафу"
              }
            </Text>

            {/* Контент штрафа */}
            <View style={styles.penaltyContainer}>
              {isCompleted ? (
                <View style={styles.warningContent}>
                  <Ionicons name="information-circle" size={20} color="#FFD93D" />
                  <Text style={styles.warningText}>
                    После удаления задачу будет невозможно восстановить
                  </Text>
                </View>
              ) : (
                <View style={styles.penaltyContent}>
                  <Text style={styles.penaltyTitle}>Штрафные санкции:</Text>
                  <View style={styles.penaltyItems}>
                    {penaltyXp > 0 && (
                      <View style={styles.penaltyItem}>
                        <View style={styles.penaltyIcon}>
                          <Ionicons name="star" size={16} color="#EF4444" />
                        </View>
                        <Text style={styles.penaltyLabel}>Опыт:</Text>
                        <Text style={styles.penaltyValue}>-{penaltyXp} XP</Text>
                      </View>
                    )}
                    {penaltyGold > 0 && (
                      <View style={styles.penaltyItem}>
                        <View style={styles.penaltyIcon}>
                          <Ionicons name="cash" size={16} color="#EF4444" />
                        </View>
                        <Text style={styles.penaltyLabel}>Золото:</Text>
                        <Text style={styles.penaltyValue}>-{penaltyGold}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>

            {/* Кнопки */}
            <View style={styles.buttons}>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.cancelButton}
              >
                <LinearGradient
                  colors={["#374151", "#4B5563"]}
                  style={styles.cancelGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.cancelText}>Отмена</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleConfirm}>
                <LinearGradient
                  colors={isCompleted ? ["#EF4444", "#DC2626"] : ["#F59E0B", "#D97706"]}
                  style={styles.confirmButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons
                    name={isCompleted ? "trash" : "close-circle"}
                    size={18}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.confirmText}>
                    {isCompleted ? "Удалить" : "Отменить"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 380,
  },
  modal: {
    padding: 30,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "rgba(255, 255, 255, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  penaltyContainer: {
    marginBottom: 30,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  warningContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  warningText: {
    color: "#FFD93D",
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  penaltyContent: {
    gap: 12,
  },
  penaltyTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  penaltyItems: {
    gap: 10,
  },
  penaltyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.25)",
  },
  penaltyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  penaltyLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    flex: 1,
  },
  penaltyValue: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "700",
    minWidth: 60,
    textAlign: "right",
  },
  buttons: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
  },
  cancelButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cancelGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  buttonIcon: {
    marginRight: 4,
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default ConfirmDeleteModal;
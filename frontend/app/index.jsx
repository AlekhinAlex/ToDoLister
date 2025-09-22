import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback
} from "react-native";

const FeatureModal = ({ visible, feature, onClose }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!feature) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modalStyles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                modalStyles.content,
                { transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={modalStyles.header}>
                <View style={[modalStyles.iconContainer, { backgroundColor: feature.color }]}>
                  <Ionicons name={feature.icon} size={28} color="#fff" />
                </View>
                <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <Text style={modalStyles.title}>{feature.title}</Text>
              <Text style={modalStyles.description}>{feature.description}</Text>

              {feature.examples && (
                <View style={modalStyles.examplesContainer}>
                  <Text style={modalStyles.examplesTitle}>Примеры:</Text>
                  {feature.examples.map((example, index) => (
                    <View key={index} style={modalStyles.exampleItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={modalStyles.exampleText}>{example}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default function Landing() {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const features = [
    {
      id: 1,
      icon: "trophy",
      title: "Достигай целей",
      description: "Наша система геймификации превращает рутинные задачи в увлекательные вызовы. Получай опыт, повышай уровень и наблюдай за своим прогрессом в реальном времени.",
      color: "#FFD700",
      examples: [
        "Ежедневные задания с наградами",
        "Система уровней и достижений",
        "Визуализация прогресса",
        "Мотивирующие уведомления"
      ]
    },
    {
      id: 2,
      icon: "star",
      title: "Зарабатывай награды",
      description: "Выполняй задачи и получай золотые монеты, которые можно потратить в нашем магазине. Открывай новые возможности и кастомизируй своего персонажа.",
      color: "#3B82F6",
      examples: [
        "Золотые монеты за выполненные задачи",
        "Бонусы за последовательность",
        "Сезонные награды",
        "Особые достижения"
      ]
    },
    {
      id: 3,
      icon: "game-controller",
      title: "Игровой подход",
      description: "Соревнуйся с друзьями, выполняй совместные задания и поднимайся в рейтинге. Преврати продуктивность в увлекательную игру!",
      color: "#10B981",
      examples: [
        "Рейтинги и таблицы лидеров",
        "Совместные задания с друзьями",
        "Еженедельные челленджи",
        "Специальные игровые события"
      ]
    }
  ];

  const handleFeaturePress = (feature) => {
    setSelectedFeature(feature);
    setIsModalVisible(true);
  };

  const handleButtonPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 50,
      friction: 3,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 3,
    }).start();
  };

  React.useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]);

    Animated.loop(pulse).start();
  }, []);

  return (
    <LinearGradient
      colors={["#0f0c29", "#302b63", "#24243e"]}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Лого с анимацией */}
        <View style={styles.logoContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <LinearGradient
              colors={["#4169d1", "#3b82f6"]}
              style={styles.logoGradient}
            >
              <Ionicons name="checkmark-done-circle" size={60} color="#fff" />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Тексты */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Todolister</Text>
          <Text style={styles.subtitle}>
            Преврати свои задачи в увлекательное приключение
          </Text>
        </View>

        {/* Особенности с интерактивностью */}
        <View style={styles.featuresContainer}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={styles.feature}
              onPress={() => handleFeaturePress(feature)}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: feature.color }]}>
                <Ionicons name={feature.icon} size={22} color="#fff" />
              </View>
              <Text style={styles.featureText}>{feature.title}</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Кнопка с анимацией */}
        <Link href="/sign-in" asChild>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.9}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <LinearGradient
                colors={["#6a11cb", "#2575fc"]}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Начать путешествие</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </Link>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Уже есть аккаунт?{" "}
            <Link href="/sign-in" style={styles.link}>
              Войти
            </Link>
          </Text>
        </View>
      </ScrollView>

      {/* Модальное окно с информацией о фиче */}
      <FeatureModal
        visible={isModalVisible}
        feature={selectedFeature}
        onClose={() => setIsModalVisible(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    minHeight: Dimensions.get('window').height,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4169d1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
    textAlign: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 15,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    maxWidth: 400,
    lineHeight: 24,
    textAlign: "center",
  },
  featuresContainer: {
    marginBottom: 40,
    width: "100%",
    maxWidth: 400,
    gap: 15,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    transition: "all 0.3s ease",
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  featureText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
    flex: 1,
  },
  button: {
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 20,
    cursor: "pointer",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  footer: {
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  link: {
    color: "#3B82F6",
    fontWeight: "600",
    cursor: "pointer",
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  content: {
    backgroundColor: "#1e1e2e",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 22,
    marginBottom: 20,
    textAlign: "center",
  },
  examplesContainer: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 15,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
  },
  exampleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    flex: 1,
  },
});
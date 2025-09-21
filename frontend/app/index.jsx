import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function Landing() {
  return (
    <LinearGradient
      colors={["#0f0c29", "#302b63", "#24243e"]}
      style={styles.gradient}
    >
      {/* Лого */}
      <View style={styles.logoContainer}>
        <LinearGradient
          colors={["#4169d1", "#3b82f6"]}
          style={styles.logoGradient}
        >
          <Ionicons name="checkmark-done-circle" size={60} color="#fff" />
        </LinearGradient>
      </View>

      {/* Тексты */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Todolister</Text>
        <Text style={styles.subtitle}>
          Преврати свои задачи в увлекательное приключение
        </Text>
      </View>

      {/* Особенности */}
      <View style={styles.featuresContainer}>
        <View style={styles.feature}>
          <Ionicons name="trophy" size={22} color="#FFD700" />
          <Text style={styles.featureText}>Достигай целей</Text>
        </View>
        <View style={styles.feature}>
          <Ionicons name="star" size={22} color="#3B82F6" />
          <Text style={styles.featureText}>Зарабатывай награды</Text>
        </View>
        <View style={styles.feature}>
          <Ionicons name="game-controller" size={22} color="#10B981" />
          <Text style={styles.featureText}>Игровой подход</Text>
        </View>
      </View>

      {/* Кнопка */}
      <Link href="/sign-in" asChild>
        <TouchableOpacity style={styles.button} activeOpacity={0.9}>
          <LinearGradient
            colors={["#6a11cb", "#2575fc"]}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Начать путешествие</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
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
    boxShadow: "0 8px 20px rgba(65,105,209,0.4)", // web-only
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
  },
  featureText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  button: {
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 20,
    cursor: "pointer", // важно для web
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
    cursor: "pointer", // важно для web
  },
});

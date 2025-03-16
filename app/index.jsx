import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  return (
    <LinearGradient colors={["#FF9A9E", "#FAD0C4"]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent} // Fixed content container style
        >
          <StatusBar style="auto" />

          <Text style={styles.title}>Добро пожаловать в ТуДуЛистер</Text>

          <Text style={styles.subtitle}>
            Помогаю сделать повседневные задачи более интересными
          </Text>

          <Link href="/sign-in" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Вперед!</Text>
            </TouchableOpacity>
          </Link>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1, // Ensure the gradient covers the entire screen
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1, // Ensure the content can scroll and take up available space
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20, // Add horizontal padding for better spacing
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center", // Center-align the title
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 40,
    textAlign: "center", // Center-align the subtitle
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 60,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF9A9E",
  },
});

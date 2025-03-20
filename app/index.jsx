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
    <LinearGradient
      colors={["#1E3A8A", "#C084FC"]}
      start={{ x: 1, y: 0 }} // Top-left
      end={{ x: 0, y: 1 }} // Bottom-right
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <StatusBar style="auto" />

          <Text style={styles.title}>Добро пожаловать в GlinoMesser</Text>

          <Text style={styles.subtitle}>
            Помогаю сделать повседневные задачи более интересными
          </Text>

          <Link href="/sign-in" style={styles.button} asChild>
            <TouchableOpacity>
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
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 40,
    textAlign: "center",
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
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E3A8A", // Match the dark blue gradient color
  },
});

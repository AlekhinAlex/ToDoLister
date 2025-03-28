import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";

export default function EditTask() {
  const params = useLocalSearchParams();
  const [title, setTitle] = React.useState(params.title || "");
  const [description, setDescription] = React.useState(
    params.description || ""
  );

  const handleSave = () => {
    // Here you would typically update the database
    console.log("Saving:", { title, description });
    router.back(); // Go back to previous screen
  };

  return (
    <View style={styles.container}>
      {/*May be use created template*/}
      <Text style={styles.label}>Название:</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Введите название задачи"
      />

      <Text style={styles.label}>Описание:</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Введите описание"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>Сохранить</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0A1F3A",
  },
  label: {
    fontSize: 16,
    color: "#FFD700",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#1E2A3A",
    color: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#C084FC",
    borderRadius: 25,
    padding: 15,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});

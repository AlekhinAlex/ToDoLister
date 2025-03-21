import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const Profile = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image
          source={{
            uri: "https://fenolog.rgo.ru/sites/default/files/styles/full_width/public/user/7286/elephant-114543960720.jpg?itok=TFzOicDs",
          }} // Temporary picture, has to be replaced with real picture
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>Иван Иванов</Text>
      </View>
      {/* End of Profile Header */}

      {/* User Information Section */}
      <View style={styles.infoContainer}>
        {/* Email card */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            padding: 15,
            marginBottom: 5,
          }}
        >
          <Ionicons name="mail-outline" size={24} color="#C084FC" />
          <Text style={styles.infoText}>ivan.ivanov@example.com</Text>
        </View>
        {/* Number card (may be not needed)*/}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            padding: 15,
            marginBottom: 5,
          }}
        >
          <Ionicons name="call-outline" size={24} color="#C084FC" />
          <Text style={styles.infoText}>+7 123 456-7890</Text>
        </View>
        {/* Location card (may be not needed)*/}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            padding: 15,
            marginBottom: 10,
          }}
        >
          <Ionicons name="location-outline" size={24} color="#C084FC" />
          <Text style={styles.infoText}>Москва, Россия</Text>
        </View>
      </View>
      {/* End of User Information Section */}

      {/* Action Buttons */}
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>Редактировать профиль</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionButton, styles.logoutButton]}>
        <Text style={styles.actionButtonText}>Выйти</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 20,
    backgroundColor: "#0A1F3A",
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
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  profileBio: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.8,
    textAlign: "center",
  },
  infoContainer: {
    width: "100%",
    marginBottom: 30,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
});

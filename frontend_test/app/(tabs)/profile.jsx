import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Button,
  Dialog,
  Portal,
  ActivityIndicator,
  useTheme,
  Provider as PaperProvider,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { getToken, removeToken, setToken } from "../(tabs)/lib/storage";
import { isTokenExpired, refreshAccessToken } from "../(tabs)/lib/authTokenManager";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import { uploadAvatar } from "../(tabs)/lib/api";

const API_BASE = "http://127.0.0.1:8000";

const ProfileScreen = () => {
  const { width: screenWidth } = useWindowDimensions();
  const isCompact = screenWidth > 764;

  const [visible, setVisible] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    avatar: "https://i.imgur.com/mCHMpLT.png",
  });
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      let token = await getToken();

      if (!token || !token.access) {
        throw new Error("Токены отсутствуют");
      }

      if (isTokenExpired(token.access)) {
        if (!token.refresh || isTokenExpired(token.refresh)) {
          throw new Error("Требуется повторная авторизация");
        }

        const newTokens = await refreshAccessToken(token.refresh);
        token = newTokens;
        await setToken(token);
      }

      const response = await fetch(`${API_BASE}/api/user/me/`, {
        headers: { Authorization: `Bearer ${token.access}` },
      });

      if (!response.ok) {
        throw new Error("Ошибка получения данных пользователя");
      }

      const data = await response.json();
      setUserData({
        name: data.name || data.username,
        email: data.email,
        avatar: `${API_BASE}${data.avatar}` || "https://i.imgur.com/mCHMpLT.png",
      });
    } catch (error) {
      console.error("Ошибка авторизации:", error);
      Toast.show({
        type: "error",
        text1: "Ошибка авторизации",
        text2: error.message || "Пожалуйста, войдите заново",
      });
      await removeToken();
      router.replace("/(auth)/sign-in");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await removeToken();
    Toast.show({
      type: "success",
      text1: "Вы вышли из аккаунта",
      position: "top",
      visibilityTime: 2000,
      topOffset: 60,
    });
    router.replace("/(auth)/sign-in");
  };

  const refreshTokenPeriodically = async () => {
    let token = await getToken();

    if (token && token.refresh && !isTokenExpired(token.refresh)) {
      setInterval(async () => {
        try {
          if (isTokenExpired(token.access)) {
            const newTokens = await refreshAccessToken(token.refresh);
            token = newTokens;
            await setToken(token);
            console.log("Токены обновлены в фоне");
          }
        } catch (error) {
          console.error("Ошибка обновления токенов в фоне:", error);
        }
      }, 10 * 60 * 1000); // каждые 10 минут
    }
  };

  const dataUrlToFile = (dataUrl, filename) => {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };


  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Ошибка", "Необходимо разрешение на доступ к галерее.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true, // Важно: Веб всегда возвращает base64, поэтому нужно явно получить его
    });

    if (result.canceled) return;

    const base64Uri = result.assets[0].uri;
    const file = dataUrlToFile(base64Uri, 'avatar.png');

    console.log("Подготовленный файл:", file);

    try {
      const token = await getToken();

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_BASE}/api/user/upload_avatar/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.access}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Ошибка загрузки аватарки");
      }

      const data = await response.json();

      setUserData(prev => ({
        ...prev,
        avatar: data.avatar_url || base64Uri,
      }));

      Toast.show({
        type: "success",
        text1: "Аватарка обновлена",
      });
    } catch (error) {
      console.error("Ошибка загрузки аватарки:", error);
      Toast.show({
        type: "error",
        text1: "Ошибка загрузки аватарки",
        text2: error.message || "Попробуйте еще раз",
      });
    }
  };





  useEffect(() => {
    fetchUserData();
    refreshTokenPeriodically();
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={["#4169d1", "#9ba7be"]} style={[styles.gradient, styles.center]}>
        <ActivityIndicator animating={true} color="#FFFFFF" />
      </LinearGradient>
    );
  }

  return (
    <PaperProvider>
      <LinearGradient colors={["#4169d1", "#9ba7be"]} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={
            !isCompact ? styles.container : styles.containerDesktop
          }
        >
          <View style={styles.profileHeader}>
            <TouchableOpacity onPress={pickImage}>
              <Image
                source={{ uri: userData.avatar }}
                style={!isCompact ? styles.profileImage : styles.profileImageDesktop}
              />
            </TouchableOpacity>
            <Text style={styles.nameText}>{userData.name}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>{userData.email}</Text>
          </View>

          <Button
            mode="contained"
            buttonColor="#FF9A9E"
            textColor="#fff"
            style={styles.logoutButton}
            onPress={showDialog}
          >
            Выйти
          </Button>

          <Portal>
            <Dialog
              visible={visible}
              onDismiss={hideDialog}
              style={{
                alignSelf: "center",
                width: isCompact ? 500 : "90%",
                borderRadius: 30,
                backgroundColor: "brown",
              }}
            >
              <Dialog.Title>Выход</Dialog.Title>
              <Dialog.Content>
                <Text>Вы уверены, что хотите выйти?</Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={hideDialog}>Отмена</Button>
                <Button onPress={handleLogout}>Выйти</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </ScrollView>
      </LinearGradient>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 20,
  },
  containerDesktop: {
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginTop: 55,
    width: 600,
    height: 800,
    padding: 20,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
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
  profileImageDesktop: {
    width: 250,
    height: 250,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    marginBottom: 15,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 10,
  },
  infoContainer: {
    verticalAlign: "auto",
    padding: 20,
    borderRadius: 30,
    verticalAlign: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    width: "100%",
    marginBottom: 30,
    alignItems: "center",
  },
  infoText: {
    fontSize: 24,
    color: "#FFFFFF",
    marginBottom: 10,
  },
  logoutButton: {
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 30,
    marginTop: 10,
    width: "100%",
  },
});

export default ProfileScreen;

import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
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
import InventoryItem from "../compnents/inventoryItem";

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
  const [inventory, setInventory] = useState([]);
  const [equippedItems, setEquippedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  // Улучшенные настройки позиционирования для каждого типа одежды
  const layerOffsets = {
    hair: {
      width: '80%',
      height: '100%',
      top: -90,
      left: '5%',
      zIndex: 5
    },
    headwear: {
      width: '80%',
      height: '100%',
      top: -90,
      left: '5%',
      zIndex: 5
    },
    top: {
      width: '100%',
      height: '60%',
      top: 40,
      zIndex: 4
    },
    bottom: {
      width: '70%',
      height: '40%',
      top: 150,
      left: '15%',
      zIndex: 3
    },
    boots: {
      width: '70%',
      height: '25%',
      top: 220,
      left: '15%',
      zIndex: 2
    },
  };

  const fetchUserData = async () => {
    setLoading(true);
    try {
      let token = await getToken();

      if (!token || !token.access) throw new Error("Токены отсутствуют");

      if (isTokenExpired(token.access)) {
        if (!token.refresh || isTokenExpired(token.refresh)) {
          throw new Error("Требуется повторная авторизация");
        }

        const newTokens = await refreshAccessToken(token.refresh);
        token = newTokens;
        await setToken(token);
      }

      const userResponse = await fetch(`${API_BASE}/api/user/me/`, {
        headers: { Authorization: `Bearer ${token.access}` },
      });

      if (!userResponse.ok) throw new Error("Ошибка получения данных пользователя");

      const userData = await userResponse.json();
      setUserData({
        name: userData.name || userData.username,
        email: userData.email,
        avatar: `${API_BASE}${userData.avatar}` || "https://i.imgur.com/mCHMpLT.png",
      });

      const inventoryResponse = await fetch(`${API_BASE}/api/character/get-character/`, {
        headers: { Authorization: `Bearer ${token.access}` },
      });

      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json();
        setInventory(inventoryData.inventory || []);

        const equipped = inventoryData.inventory?.filter(item => item.is_equipped === true) || [];
        setEquippedItems(equipped);
      }
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

  const handleEquipItem = async (itemId, itemType) => {
    try {
      const token = await getToken();

      if (!token || !token.access) {
        throw new Error("Требуется авторизация");
      }

      const response = await fetch(`${API_BASE}/api/character/change-item/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inventory_item_id: itemId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка при экипировке предмета");
      }

      const updatedResponse = await fetch(`${API_BASE}/api/character/get-character/`, {
        headers: { Authorization: `Bearer ${token.access}` },
      });

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setInventory(updatedData.inventory || []);
        const equipped = updatedData.inventory?.filter(item => item.is_equipped === true) || [];
        setEquippedItems(equipped);
      }

      Toast.show({
        type: "success",
        text1: "Предмет экипирован",
      });
    } catch (error) {
      console.error("Ошибка при экипировке:", error);
      Toast.show({
        type: "error",
        text1: "Ошибка",
        text2: error.message || "Не удалось экипировать предмет",
      });
    }
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
      base64: true,
    });

    if (result.canceled) return;

    const base64Uri = result.assets[0].uri;
    const file = dataUrlToFile(base64Uri, 'avatar.png');

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

  const EQUIP_PRIORITY = ["hair", "headwear", "top", "bottom", "boots"];

  const sortedEquippedItems = [...equippedItems].sort((a, b) => {
    const getPriority = (item) => EQUIP_PRIORITY.indexOf(item.item.type ?? "boots");
    return getPriority(a) - getPriority(b);
  });

  useEffect(() => {
    fetchUserData();
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
        <ScrollView contentContainerStyle={styles.container}>
          <View style={[styles.profileSection, isCompact && styles.rowLayout]}>
            <View style={styles.profileInfo}>
              <View style={styles.profileHeader}>
                <TouchableOpacity onPress={pickImage}>
                  <Image source={{ uri: userData.avatar }} style={styles.profileImage} />
                </TouchableOpacity>
                <Text style={styles.nameText}>{userData.name}</Text>
                <Text style={styles.emailText}>{userData.email}</Text>
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
            </View>

            <View style={styles.characterPreview}>
              <Text style={styles.characterTitle}>Мой персонаж</Text>
              <View style={styles.characterImageContainer}>
                {sortedEquippedItems.length > 0 ? (
                  <View style={styles.characterLayers}>
                    {sortedEquippedItems.map((item, index) => {
                      const type = item.item?.type || "default";
                      const layerStyle = {
                        ...styles.characterLayer,
                        ...(layerOffsets[type] || {}),
                      };

                      return (
                        <Image
                          key={index}
                          source={{ uri: item.item?.image_character_url || item.item?.image_preview_url }}
                          style={layerStyle}
                        />
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.noEquipmentText}>Нет экипированных предметов</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.inventoryContainer}>
            <Text style={styles.inventoryTitle}>Мой инвентарь</Text>
            <ScrollView contentContainerStyle={styles.inventoryGrid}>
              {inventory.map((item) => (
                <InventoryItem
                  key={item.id}
                  name={item.item.name}
                  image={item.item.image_preview_url}
                  status={item.is_purchased ? "Куплено" : "Разблокировано"}
                  isEquipped={item.is_equipped}
                  onEquip={() => handleEquipItem(item.id, item.item.type)}
                />
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        <Portal>
          <Dialog
            visible={visible}
            onDismiss={hideDialog}
            style={styles.dialog}
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
      </LinearGradient>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  profileSection: {
    width: '100%',
    maxWidth: 1000,
    marginBottom: 30,
  },
  rowLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileInfo: {
    flex: 1,
    maxWidth: 400,
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingVertical: 15,
    borderRadius: 20,
    width: '100%',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  nameText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
  },
  emailText: {
    color: "white",
    fontSize: 20,
    marginTop: 10,
  },
  logoutButton: {
    paddingVertical: 8,
    width: '100%',
    maxWidth: 400,
    marginTop: 20,
  },
  characterPreview: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 400,
  },
  characterTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  characterImageContainer: {
    marginTop: 40,
    width: 200,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  characterLayers: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  characterLayer: {
    position: 'absolute',
    resizeMode: 'contain',
  },
  noEquipmentText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  inventoryContainer: {
    marginTop: 20,
    width: "100%",
    maxWidth: 1000,
    paddingHorizontal: 10,
    marginBottom: 50,
  },
  inventoryTitle: {
    fontSize: 40,
    fontWeight: "800",
    color: "#ffffff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 15,
  },
  inventoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  dialog: {
    alignSelf: "center",
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
  },
});

export default ProfileScreen;
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Image,
//   StyleSheet,
//   ScrollView,
//   useWindowDimensions,
//   TouchableOpacity,
// } from "react-native";
// import {
//   Text,
//   ActivityIndicator,
// } from "react-native-paper";
// import { LinearGradient } from "expo-linear-gradient";
// import { getToken, removeToken, setToken } from "../lib/storage";
// import { isTokenExpired, refreshAccessToken } from "../lib/authTokenManager";
// import { router } from "expo-router";
// import Toast from "react-native-toast-message";
// import * as ImagePicker from "expo-image-picker";
// import InventoryItem from "../compnents/inventoryItem";
// import { API_BASE } from "../lib/api";
// import { Ionicons } from "@expo/vector-icons";

// const ProfileScreen = () => {
//   const { width: screenWidth } = useWindowDimensions();
//   const isCompact = screenWidth > 764;

//   const [visible, setVisible] = useState(false);
//   const [inventory, setInventory] = useState([]);
//   const [equippedItems, setEquippedItems] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const showDialog = () => setVisible(true);
//   const hideDialog = () => setVisible(false);

//   const layerOffsets = {
//     hair: {
//       width: '80%',
//       height: '100%',
//       top: -90,
//       left: '5%',
//       zIndex: 5
//     },
//     headwear: {
//       width: '80%',
//       height: '100%',
//       top: -90,
//       left: '5%',
//       zIndex: 5
//     },
//     top: {
//       width: '100%',
//       height: '60%',
//       top: 40,
//       zIndex: 4
//     },
//     bottom: {
//       width: '70%',
//       height: '40%',
//       top: 150,
//       left: '15%',
//       zIndex: 3
//     },
//     boots: {
//       width: '70%',
//       height: '25%',
//       top: 220,
//       left: '15%',
//       zIndex: 2
//     },
//   };

//   const fetchUserData = async () => {
//     setLoading(true);
//     try {
//       let token = await getToken();

//       if (!token || !token.access) throw new Error("Токены отсутствуют");

//       if (isTokenExpired(token.access)) {
//         if (!token.refresh || isTokenExpired(token.refresh)) {
//           throw new Error("Требуется повторная авторизация");
//         }

//         const newTokens = await refreshAccessToken(token.refresh);
//         token = newTokens;
//         await setToken(token);
//       }

//       const userResponse = await fetch(`${API_BASE}/api/user/me/`, {
//         headers: { Authorization: `Bearer ${token.access}` },
//       });

//       if (!userResponse.ok) throw new Error("Ошибка получения данных пользователя");

//       const inventoryResponse = await fetch(`${API_BASE}/api/character/get-character/`, {
//         headers: { Authorization: `Bearer ${token.access}` },
//       });

//       if (inventoryResponse.ok) {
//         const inventoryData = await inventoryResponse.json();
//         setInventory(inventoryData.inventory || []);

//         const equipped = inventoryData.inventory?.filter(item => item.is_equipped === true) || [];
//         setEquippedItems(equipped);
//       }
//     } catch (error) {
//       console.error("Ошибка авторизации:", error);
//       Toast.show({
//         type: "error",
//         text1: "Ошибка авторизации",
//         text2: error.message || "Пожалуйста, войдите заново",
//       });
//       await removeToken();
//       router.replace("/(auth)/sign-in");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = async () => {
//     await removeToken();
//     Toast.show({
//       type: "success",
//       text1: "Вы вышли из аккаунта",
//       position: "top",
//       visibilityTime: 2000,
//       topOffset: 60,
//     });
//     router.replace("/(auth)/sign-in");
//   };

//   const handleEquipItem = async (itemId, itemType) => {
//     try {
//       const token = await getToken();

//       if (!token || !token.access) {
//         throw new Error("Требуется авторизация");
//       }

//       const response = await fetch(`${API_BASE}/api/character/change-item/`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token.access}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           inventory_item_id: itemId
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Ошибка при экипировке предмета");
//       }

//       const updatedResponse = await fetch(`${API_BASE}/api/character/get-character/`, {
//         headers: { Authorization: `Bearer ${token.access}` },
//       });

//       if (updatedResponse.ok) {
//         const updatedData = await updatedResponse.json();
//         setInventory(updatedData.inventory || []);
//         const equipped = updatedData.inventory?.filter(item => item.is_equipped === true) || [];
//         setEquippedItems(equipped);
//       }

//       Toast.show({
//         type: "success",
//         text1: "Предмет экипирован",
//       });
//     } catch (error) {
//       console.error("Ошибка при экипировке:", error);
//       Toast.show({
//         type: "error",
//         text1: "Ошибка",
//         text2: error.message || "Не удалось экипировать предмет",
//       });
//     }
//   };


//   const EQUIP_PRIORITY = ["hair", "headwear", "top", "bottom", "boots"];

//   const sortedEquippedItems = [...equippedItems].sort((a, b) => {
//     const getPriority = (item) => EQUIP_PRIORITY.indexOf(item.item.type ?? "boots");
//     return getPriority(a) - getPriority(b);
//   });

//   useEffect(() => {
//     fetchUserData();
//   }, []);

//   if (loading) {
//     return (
//       <LinearGradient colors={["#0f0c29", "#302b63", "#24243e"]} style={[styles.gradient, styles.center]}>
//         <ActivityIndicator animating={true} color="#FFFFFF" size="large" />
//       </LinearGradient>
//     );
//   }

//   return (
//     <LinearGradient colors={["#0f0c29", "#302b63", "#24243e"]} style={styles.gradient}>
//       <ScrollView contentContainerStyle={styles.container}>
//         {/* Заголовок профиля */}
//         <View style={styles.header}>
//           <Ionicons name="person-circle" size={32} color="#fff" />
//           <Text style={styles.headerTitle}>Профиль</Text>
//         </View>

//         <View style={[styles.profileSection, isCompact && styles.rowLayout]}>


//           <View style={styles.characterPreview}>
//             <Text style={styles.characterTitle}>Мой персонаж</Text>
//             <View style={styles.characterImageContainer}>
//               {sortedEquippedItems.length > 0 ? (
//                 <View style={styles.characterLayers}>
//                   {sortedEquippedItems.map((item, index) => {
//                     const type = item.item?.type || "default";
//                     const layerStyle = {
//                       ...styles.characterLayer,
//                       ...(layerOffsets[type] || {}),
//                     };

//                     return (
//                       <Image
//                         key={index}
//                         source={{ uri: item.item?.image_character_url || item.item?.image_preview_url }}
//                         style={layerStyle}
//                       />
//                     );
//                   })}
//                 </View>
//               ) : (
//                 <View style={styles.noEquipment}>
//                   <Ionicons name="person-outline" size={60} color="rgba(255,255,255,0.3)" />
//                   <Text style={styles.noEquipmentText}>Нет экипированных предметов</Text>
//                 </View>
//               )}
//             </View>
//           </View>
//         </View>

//         <View style={styles.inventoryContainer}>
//           <View style={styles.inventoryHeader}>
//             <Ionicons name="cube" size={28} color="#fff" />
//             <Text style={styles.inventoryTitle}>Мой инвентарь</Text>
//           </View>
//           <View style={styles.inventoryGrid}>
//             {inventory.map((item) => (
//               <InventoryItem
//                 key={item.id}
//                 name={item.item.name}
//                 image={item.item.image_preview_url}
//                 status={item.is_purchased ? "Куплено" : "Разблокировано"}
//                 isEquipped={item.is_equipped}
//                 onEquip={() => handleEquipItem(item.id, item.item.type)}
//               />
//             ))}
//           </View>
//         </View>

//       </ScrollView>

//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   gradient: {
//     flex: 1,
//   },
//   center: {
//     justifyContent: "center",
//     alignItems: "center"
//   },
//   container: {
//     flexGrow: 1,
//     padding: 20,
//     paddingBottom: 80,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 30,
//     gap: 12,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#fff',
//   },
//   profileSection: {
//     marginBottom: 30,
//   },
//   rowLayout: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 20,
//   },
//   profileInfo: {
//     flex: 1,
//   },
//   profileHeader: {
//     alignItems: "center",
//     backgroundColor: "rgba(255, 255, 255, 0.1)",
//     padding: 20,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.2)',
//   },
//   avatarContainer: {
//     position: 'relative',
//     marginBottom: 15,
//   },
//   profileImage: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     borderWidth: 3,
//     borderColor: 'rgba(255,255,255,0.3)',
//   },
//   editAvatarOverlay: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     backgroundColor: '#4169d1',
//     borderRadius: 20,
//     padding: 6,
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
//   nameText: {
//     color: "white",
//     fontSize: 24,
//     fontWeight: "600",
//     marginBottom: 5,
//   },
//   emailText: {
//     color: "rgba(255,255,255,0.8)",
//     fontSize: 16,
//   },
//   characterPreview: {
//     flex: 1,
//     backgroundColor: "rgba(255, 255, 255, 0.1)",
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.2)',
//     minHeight: 300,
//   },
//   characterTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: 'white',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   characterImageContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     minHeight: 250,
//   },
//   characterLayers: {
//     width: 200,
//     height: 300,
//     position: 'relative',
//   },
//   characterLayer: {
//     position: 'absolute',
//     resizeMode: 'contain',
//   },
//   noEquipment: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 10,
//   },
//   noEquipmentText: {
//     color: 'rgba(255,255,255,0.6)',
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   inventoryContainer: {
//     marginBottom: 20,
//   },
//   inventoryHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     marginBottom: 20,
//   },
//   inventoryTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#ffffff",
//   },
//   inventoryGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 15,
//     justifyContent: 'center',
//   },
//   logoutButton: {
//     width: '25vh',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 10,
//     backgroundColor: 'rgba(239, 68, 68, 0.2)',
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: 'rgba(239, 68, 68, 0.3)',
//     marginTop: 20,
//   },
//   logoutText: {
//     color: '#EF4444',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// const dialogStyles = StyleSheet.create({
//   overlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   modal: {
//     width: '100%',
//     maxWidth: 400,
//     backgroundColor: '#1A1A1A',
//     borderRadius: 16,
//     padding: 24,
//     borderWidth: 1,
//     borderColor: '#333',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     marginBottom: 20,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#fff',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: 'rgba(255,255,255,0.8)',
//     textAlign: 'center',
//     marginBottom: 25,
//     lineHeight: 24,
//   },
//   buttons: {
//     flexDirection: 'row',
//     gap: 12,
//     justifyContent: 'center',
//   },
//   cancelButton: {
//     flex: 1,
//     padding: 16,
//     borderRadius: 12,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.2)',
//   },
//   cancelText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   confirmButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     padding: 16,
//     borderRadius: 12,
//     backgroundColor: '#EF4444',
//   },
//   confirmText: {
//     color: '#fff',
//     fontWeight: '700',
//     fontSize: 16,
//   },
// });

// export default ProfileScreen;

//!NEW VERSION?

import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import {
  Text,
  ActivityIndicator,
  Card,
  Chip,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { getToken, removeToken, setToken } from "../lib/storage";
import { isTokenExpired, refreshAccessToken } from "../lib/authTokenManager";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import InventoryItem from "../compnents/inventoryItem";
import RankDisplay from "../compnents/rankModal";
import { API_BASE } from "../lib/api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const ProfileScreen = () => {
  const { width: screenWidth } = useWindowDimensions();
  const isCompact = screenWidth > 764;

  const [visible, setVisible] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [equippedItems, setEquippedItems] = useState([]);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    gold: 0,
    xp: 0,
    rank: null
  });
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [nextRank, setNextRank] = useState(null);
  const [scaleAnim] = useState(new Animated.Value(1));

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const layerOffsets = {
    hair: { width: '80%', height: '100%', top: -90, left: '5%', zIndex: 5 },
    headwear: { width: '80%', height: '100%', top: -90, left: '5%', zIndex: 5 },
    top: { width: '100%', height: '60%', top: 40, zIndex: 4 },
    bottom: { width: '70%', height: '40%', top: 150, left: '15%', zIndex: 3 },
    boots: { width: '70%', height: '25%', top: 220, left: '15%', zIndex: 2 },
  };

  const CATEGORIES = [
    { id: 'all', label: 'Все', icon: 'grid' },
    { id: 'hair', label: 'Прически', icon: 'cut' },
    { id: 'headwear', label: 'Головные уборы', icon: 'baseball' },
    { id: 'top', label: 'Верх', icon: 'shirt' },
    { id: 'bottom', label: 'Низ', icon: 'body' },
    { id: 'boots', label: 'Обувь', icon: 'footsteps' },
  ];

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

      const [userResponse, inventoryResponse, ranksResponse] = await Promise.all([
        fetch(`${API_BASE}/api/user/me/`, {
          headers: { Authorization: `Bearer ${token.access}` },
        }),
        fetch(`${API_BASE}/api/character/get-character/`, {
          headers: { Authorization: `Bearer ${token.access}` },
        }),
        fetch(`${API_BASE}/api/ranks/`, {
          headers: { Authorization: `Bearer ${token.access}` },
        })
      ]);

      if (!userResponse.ok) throw new Error("Ошибка получения данных пользователя");

      const userData = await userResponse.json();
      setUserData({
        name: userData.name || userData.username,
        email: userData.email,
        gold: userData.gold || 0,
        xp: userData.xp || 0,
        rank: userData.rank
      });

      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json();
        setInventory(inventoryData.inventory || []);
        const equipped = inventoryData.inventory?.filter(item => item.is_equipped === true) || [];
        setEquippedItems(equipped);
      }

      if (ranksResponse.ok) {
        const ranksData = await ranksResponse.json();
        const currentRankIndex = ranksData.findIndex(r => r.id === userData.rank?.id);
        if (currentRankIndex < ranksData.length - 1) {
          setNextRank(ranksData[currentRankIndex + 1]);
        }
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

  const filteredInventory = activeCategory === 'all'
    ? inventory
    : inventory.filter(item => item.item?.type === activeCategory);

  const handleEquipItem = async (itemId, itemType) => {
    try {
      const token = await getToken();
      if (!token || !token.access) throw new Error("Требуется авторизация");

      // Анимация нажатия
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();

      const response = await fetch(`${API_BASE}/api/character/change-item/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inventory_item_id: itemId }),
      });

      if (!response.ok) throw new Error("Ошибка при экипировке предмета");

      const updatedResponse = await fetch(`${API_BASE}/api/character/get-character/`, {
        headers: { Authorization: `Bearer ${token.access}` },
      });

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setInventory(updatedData.inventory || []);
        const equipped = updatedData.inventory?.filter(item => item.is_equipped === true) || [];
        setEquippedItems(equipped);
      }

      Toast.show({ type: "success", text1: "Предмет экипирован" });
    } catch (error) {
      Toast.show({ type: "error", text1: "Ошибка", text2: error.message });
    }
  };

  const EQUIP_PRIORITY = ["hair", "headwear", "top", "bottom", "boots"];
  const sortedEquippedItems = [...equippedItems].sort((a, b) => {
    return EQUIP_PRIORITY.indexOf(a.item?.type) - EQUIP_PRIORITY.indexOf(b.item?.type);
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={["#0f0c29", "#302b63", "#24243e"]} style={[styles.gradient, styles.center]}>
        <ActivityIndicator animating={true} color="#FFFFFF" size="large" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0f0c29", "#302b63", "#24243e"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Заголовок профиля с аватаром */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={48} color="#fff" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.userName}>{userData.name}</Text>
              <Text style={styles.userEmail}>{userData.email}</Text>
            </View>
          </View>
          <Ionicons name="settings" size={24} color="#fff" onPress={() => router.push('/settings')} />
        </View>

        {/* Прогресс и ранг */}
        <View style={styles.rankSection}>
          <RankDisplay
            xp={userData.xp}
            rank={userData.rank}
            nextRank={nextRank}
            money={userData.gold}
          />
        </View>

        {/* Быстрая статистика */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="cube" size={20} color="#4169E1" />
            <Text style={styles.statNumber}>{inventory.filter(item => item.is_purchased).length}</Text>
            <Text style={styles.statLabel}>Предметов</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="hanger" size={20} color="#FF6B6B" />
            <Text style={styles.statNumber}>{equippedItems.length}</Text>
            <Text style={styles.statLabel}>Экипировано</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="complete" size={20} color="#4CAF50" />
            <Text style={styles.statNumber}>{Math.round((equippedItems.length / Math.max(1, inventory.length)) * 100)}%</Text>
            <Text style={styles.statLabel}>Комплект</Text>
          </View>
        </View>

        {/* Персонаж */}
        <View style={styles.characterSection}>
          <Text style={styles.sectionTitle}>👤 Мой персонаж</Text>
          <Animated.View style={[styles.characterCard, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
              style={styles.characterGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.characterImageContainer}>
                {sortedEquippedItems.length > 0 ? (
                  <View style={styles.characterLayers}>
                    {sortedEquippedItems.map((item, index) => (
                      <Image
                        key={index}
                        source={{ uri: item.item?.image_character_url }}
                        style={[styles.characterLayer, layerOffsets[item.item?.type]]}
                        onError={(e) => console.log('Image load error')}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={styles.noEquipment}>
                    <Ionicons name="person-outline" size={60} color="rgba(255,255,255,0.3)" />
                    <Text style={styles.noEquipmentText}>Нет экипированных предметов</Text>
                    <Text style={styles.noEquipmentSubtext}>Посетите магазин чтобы приобрести вещи</Text>
                  </View>
                )}
              </View>

              {sortedEquippedItems.length > 0 && (
                <View style={styles.equippedItemsList}>
                  <Text style={styles.equippedTitle}>🎯 Экипировано:</Text>
                  <View style={styles.chipsContainer}>
                    {sortedEquippedItems.map((item, index) => (
                      <Chip
                        key={index}
                        style={styles.equippedChip}
                        textStyle={styles.chipText}
                        icon={() => <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />}
                      >
                        {item.item.name}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Инвентарь */}
        <View style={styles.inventorySection}>
          <View style={styles.inventoryHeader}>
            <View style={styles.inventoryTitleContainer}>
              <Ionicons name="cube" size={28} color="#fff" />
              <Text style={styles.sectionTitle}>🎒 Инвентарь</Text>
              <Text style={styles.inventoryCount}>({filteredInventory.length})</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/shop')} style={styles.shopButton}>
              <Ionicons name="storefront" size={20} color="#fff" />
              <Text style={styles.shopButtonText}>Магазин</Text>
            </TouchableOpacity>
          </View>

          {/* Категории */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  activeCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setActiveCategory(category.id)}
              >
                <Ionicons
                  name={category.icon}
                  size={16}
                  color={activeCategory === category.id ? '#fff' : '#888'}
                />
                <Text style={[
                  styles.categoryText,
                  activeCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Сетка инвентаря */}
          {filteredInventory.length > 0 ? (
            <View style={styles.inventoryGrid}>
              {filteredInventory.map((item) => (
                <InventoryItem
                  key={item.id}
                  item={item}
                  onEquip={() => handleEquipItem(item.id, item.item.type)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyInventory}>
              <Ionicons name="sad-outline" size={48} color="rgba(255,255,255,0.4)" />
              <Text style={styles.emptyText}>
                {activeCategory === 'all' ? 'Инвентарь пуст' : `Нет предметов в категории "${CATEGORIES.find(c => c.id === activeCategory)?.label}"`}
              </Text>
              <TouchableOpacity onPress={() => router.push('/shop')} style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Перейти в магазин</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
  container: { flexGrow: 1, padding: 20, paddingBottom: 40 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerText: {
    gap: 4,
  },
  userName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  userEmail: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },

  // Rank Section
  rankSection: {
    marginBottom: 24,
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginVertical: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
  },

  // Sections
  characterSection: { marginBottom: 24 },
  inventorySection: { marginBottom: 20 },
  sectionTitle: { fontSize: 24, fontWeight: "700", color: "#ffffff", marginBottom: 16 },

  // Character
  characterCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  characterGradient: {
    padding: 20,
  },
  characterImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
  },
  characterLayers: { width: 200, height: 300, position: 'relative' },
  characterLayer: { position: 'absolute', resizeMode: 'contain' },
  noEquipment: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
  },
  noEquipmentText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  noEquipmentSubtext: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    textAlign: 'center',
  },
  equippedItemsList: { marginTop: 16 },
  equippedTitle: {
    color: '#fff',
    marginBottom: 12,
    fontWeight: '600',
    fontSize: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equippedChip: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
  },
  chipText: { color: '#fff', fontSize: 12 },

  // Inventory
  inventoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  inventoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  inventoryCount: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Categories
  categoriesContainer: { marginBottom: 20 },
  categoriesContent: { paddingHorizontal: 4 },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 6
  },
  categoryButtonActive: {
    backgroundColor: '#4169E1',
    borderColor: '#4169E1',
  },
  categoryText: { color: '#888', fontSize: 12, fontWeight: '500' },
  categoryTextActive: { color: '#fff', fontWeight: '600' },

  // Inventory Grid
  inventoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: 'flex-start',
    marginBottom: 20,
  },

  // Empty State
  emptyInventory: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    fontSize: 16,
  },
  emptyButton: {
    backgroundColor: 'rgba(65, 105, 225, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(65, 105, 225, 0.3)',
    marginTop: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

});

export default ProfileScreen;
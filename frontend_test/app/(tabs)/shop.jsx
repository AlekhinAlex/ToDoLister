import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import RankDisplay from "../compnents/rankModal";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ShopItem from "../compnents/shopItem";
import { isTokenExpired, refreshAccessToken } from "./lib/authTokenManager";
import { getToken, setToken } from "./lib/storage";
import Toast from "react-native-toast-message";

const API_BASE = "http://127.0.0.1:8000";

const ShopScreen = () => {
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [characterData, setCharacterData] = useState({
    gold: 0,
    xp: 0,
    rank: null,
    next_rank: null,
  });

  useEffect(() => {
    fetchShopAndBalance();
  }, []);

  const fetchShopAndBalance = async () => {
    try {
      setLoading(true);
      const { access, refresh } = await getToken();

      if (isTokenExpired(access)) {
        const { access: newAccess, refresh: newRefresh } = await refreshAccessToken(refresh, access);
        setToken({ access: newAccess, refresh: newRefresh });
        await getShopAndBalanceWithToken(newAccess);
      } else {
        await getShopAndBalanceWithToken(access);
      }
    } catch (error) {
      console.error("Ошибка при получении данных:", error);
      Toast.show({ type: "error", text1: "Ошибка при загрузке магазина" });
    } finally {
      setLoading(false);
    }
  };

  const getShopAndBalanceWithToken = async (accessToken) => {
    try {
      const [shopResponse, characterResponse, ranksResponse] = await Promise.all([
        fetch(`${API_BASE}/api/shop/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }),
        fetch(`${API_BASE}/api/character/get-character/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }),
        fetch(`${API_BASE}/api/ranks/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      ]);

      if (!shopResponse.ok) throw new Error("Ошибка при получении магазина");
      const items = await shopResponse.json();

      let inventoryItems = [];
      let userXP = 0;
      let userGold = 0;

      if (characterResponse.ok) {
        const characterData = await characterResponse.json();
        inventoryItems = characterData.inventory || [];
        userXP = characterData.xp || 0;
        userGold = characterData.gold || 0;
      }

      // Получаем данные о рангах
      let currentRank = null;
      let nextRank = null;
      const ranksData = ranksResponse.ok ? await ranksResponse.json() : [];
      const sortedRanks = [...ranksData].sort((a, b) => a.required_xp - b.required_xp);

      for (let i = 0; i < sortedRanks.length; i++) {
        const rank = sortedRanks[i];
        if (userXP >= rank.required_xp) {
          currentRank = rank;
        } else if (!nextRank) {
          nextRank = rank;
        }
      }

      // Объединяем данные о предметах
      const mergedItems = items
        .filter(item => !item.is_default)
        .map(item => {
          const inventoryItem = inventoryItems.find(i => i.item && i.item.id === item.id);
          const isAvailable = !item.required_rank ||
            (currentRank && currentRank.id >= item.required_rank.id);

          return {
            ...item,
            is_unlocked: inventoryItem ? inventoryItem.is_unlocked : false,
            is_purchased: inventoryItem ? inventoryItem.is_purchased : false,
            is_available: isAvailable,
            required_rank_name: item.required_rank?.name || null
          };
        });

      // Сортируем: сначала доступные, потом по рангу
      mergedItems.sort((a, b) => {
        if (a.is_available !== b.is_available) return a.is_available ? -1 : 1;
        return (a.required_rank?.id || 0) - (b.required_rank?.id || 0);
      });

      setShopItems(mergedItems);
      setCharacterData({
        gold: userGold,
        xp: userXP,
        rank: currentRank,
        next_rank: nextRank
      });

    } catch (error) {
      console.error("Ошибка при получении данных пользователя:", error.message);
      throw error;
    }
  };

  const handleUnlock = async (itemId) => {
    try {
      const item = shopItems.find((item) => item.id === itemId);
      if (!item) return;

      if (!item.is_available) {
        Toast.show({ type: "error", text1: "Предмет недоступен для вашего ранга!" });
        return;
      }

      if (item.is_unlocked) {
        Toast.show({ type: "info", text1: "Предмет уже разблокирован" });
        return;
      }

      if (characterData.xp < item.required_xp) {
        Toast.show({ type: "error", text1: "Недостаточно опыта для разблокировки!" });
        return;
      }

      const { access } = await getToken();
      const response = await fetch(`${API_BASE}/api/shop/${itemId}/unlock/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Ошибка при разблокировке");
      }

      Toast.show({ type: "success", text1: "Предмет разблокирован!" });
      await fetchShopAndBalance();
    } catch (error) {
      console.error("Ошибка при разблокировке:", error.message);
      Toast.show({
        type: "error",
        text1: error.message || "Не удалось разблокировать предмет."
      });
    }
  };

  const handlePurchase = async (itemId) => {
    try {
      const item = shopItems.find((item) => item.id === itemId);
      if (!item) return;

      if (!item.is_available) {
        Toast.show({ type: "error", text1: "Предмет недоступен для вашего ранга!" });
        return;
      }

      if (!item.is_unlocked) {
        Toast.show({ type: "error", text1: "Сначала разблокируйте предмет!" });
        return;
      }

      if (item.is_purchased) {
        Toast.show({ type: "info", text1: "Предмет уже куплен" });
        return;
      }

      if (characterData.gold < item.price) {
        Toast.show({ type: "error", text1: "Недостаточно золота!" });
        return;
      }

      const { access } = await getToken();
      const response = await fetch(`${API_BASE}/api/shop/${itemId}/purchase/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Ошибка при покупке");
      }

      Toast.show({ type: "success", text1: "Предмет куплен!" });
      await fetchShopAndBalance();
    } catch (error) {
      console.error("Ошибка при покупке:", error.message);
      Toast.show({
        type: "error",
        text1: error.message || "Не удалось купить товар."
      });
    }
  };

  return (
    <LinearGradient colors={["#4169d1", "#9ba7be"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="cart" size={50} color="#fff" />
            <Text style={styles.title}>Магазин</Text>
          </View>

          {Dimensions.get("window").width > 764 && (
            <View style={styles.statusContainerCompact}>
              <RankDisplay
                xp={characterData.xp}
                money={characterData.gold}
                rank={characterData.rank}
                nextRank={characterData.next_rank}
              />
            </View>
          )}
        </View>

        {Dimensions.get("window").width < 764 && (
          <View style={styles.statusContainerCompact}>
            <RankDisplay
              xp={characterData.xp}
              money={characterData.gold}
              rank={characterData.rank}
              nextRank={characterData.next_rank}
            />
          </View>
        )}

        <View style={styles.itemsGrid}>
          {shopItems.map((item) => (
            <ShopItem
              key={item.id.toString()}
              name={item.name}
              description={item.description}
              price={item.price}
              required_rank={item.required_rank?.id}
              rank_name={item.required_rank?.name}
              is_available={item.is_available}
              is_unlocked={item.is_unlocked}
              is_purchased={item.is_purchased}
              image={item.image_preview_url}
              onUnlock={() => handleUnlock(item.id)}
              onPurchase={() => handlePurchase(item.id)}
              current_rank={characterData.rank?.id || 0}
            />
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 100,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#ffffff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemsGrid: {
    gap: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  statusText: {
    color: "#FFD700",
    marginLeft: 6,
    fontSize: 20,
    fontWeight: "600",
  },
  statusContainer: {
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusContainer: { alignItems: "center", gap: 8, marginTop: 10 },
  statusContainerCompact: { alignItems: "center", gap: 8, marginTop: 10, marginBottom: 20 },
});

export default ShopScreen;
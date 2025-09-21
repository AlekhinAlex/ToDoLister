import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity } from "react-native";
import RankDisplay from "../compnents/rankModal";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ShopItem from "../compnents/shopItem";
import { isTokenExpired, refreshAccessToken } from "../lib/authTokenManager";
import { getToken, setToken } from "../lib/storage";
import Toast from "react-native-toast-message";
import { API_BASE } from "../lib/api";

const ShopScreen = () => {
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [characterData, setCharacterData] = useState({
    gold: 0,
    xp: 0,
    rank: null,
    next_rank: null,
  });
  const [activeCategory, setActiveCategory] = useState('all');

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

  const categories = [
    { id: 'all', label: 'Все', icon: 'grid' },
    { id: 'hair', label: 'Прически', icon: 'cut' },
    { id: 'headwear', label: 'Головные уборы', icon: 'baseball' },
    { id: 'top', label: 'Верх', icon: 'shirt' },
    { id: 'bottom', label: 'Низ', icon: 'body' },
    { id: 'boots', label: 'Обувь', icon: 'footsteps' },
  ];

  const filteredItems = activeCategory === 'all'
    ? shopItems
    : shopItems.filter(item => item.type === activeCategory);

  if (loading) {
    return (
      <LinearGradient colors={["#0f0c29", "#302b63", "#24243e"]} style={[styles.gradient, styles.center]}>
        <ActivityIndicator animating={true} color="#FFFFFF" size="large" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0f0c29", "#302b63", "#24243e"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Заголовок */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="cart" size={32} color="#fff" />
            <Text style={styles.title}>Магазин</Text>
          </View>

          <View style={styles.balanceContainer}>
            <View style={styles.balanceItem}>
              <Ionicons name="cash" size={20} color="#FFD700" />
              <Text style={styles.balanceText}>{characterData.gold}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Ionicons name="star" size={20} color="#3B82F6" />
              <Text style={styles.balanceText}>{characterData.xp}</Text>
            </View>
          </View>
        </View>

        {/* Статус ранга */}
        <View style={styles.rankContainer}>
          <RankDisplay
            xp={characterData.xp}
            money={characterData.gold}
            rank={characterData.rank}
            nextRank={characterData.next_rank}
            compact={true}
          />
        </View>

        {/* Категории */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
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
                size={20}
                color={activeCategory === category.id ? "#4169d1" : "#aaa"}
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

        {/* Сетка товаров */}
        <View style={styles.itemsGrid}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
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
                type={item.type}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-off" size={60} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyStateText}>
                {activeCategory === 'all'
                  ? 'Магазин пуст'
                  : `Нет предметов в категории "${categories.find(c => c.id === activeCategory)?.label}"`
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  balanceContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  balanceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rankContainer: {
    marginBottom: 20,
  },
  categoriesContainer: {
    marginBottom: 20,
    maxHeight: 40,
  },
  categoriesContent: {
    gap: 10,
    paddingHorizontal: 5,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(65, 105, 209, 0.2)',
    borderColor: '#4169d1',
  },
  categoryText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#4169d1',
    fontWeight: '600',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 15,
  },
  emptyStateText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ShopScreen;
import { ScrollView, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import ShopItem from "../compnents/shopItem";
import { LinearGradient } from "expo-linear-gradient";

const ShopScreen = () => {
  /*This is onle examples of needed data, which will be received from db*/

  const shopItems = [
    {
      id: 1,
      name: "Золотая корона",
      price: 500,
      image:
        "https://basket-04.wbbasket.ru/vol640/part64076/64076733/images/big/1.webp",
      description: "Эксклюзивный головной убор для вашего аватара",
    },
    {
      id: 2,
      name: "Синий плащ",
      price: 300,
      image:
        "https://basket-04.wbbasket.ru/vol640/part64076/64076733/images/big/1.webp",
      description: "Стильный плащ для персонажа",
    },
    {
      id: 3,
      name: "Магический посох",
      price: 750,
      image:
        "https://basket-04.wbbasket.ru/vol640/part64076/64076733/images/big/1.webp",
      description: "Увеличивает магическую силу",
    },
    {
      id: 4,
      name: "Редкий питомец",
      price: 1000,
      image:
        "https://basket-04.wbbasket.ru/vol640/part64076/64076733/images/big/1.webp",
      description: "Особый компаньон для вашего профиля",
    },
    {
      id: 5,
      name: "Эпический меч",
      price: 800,
      image:
        "https://basket-04.wbbasket.ru/vol640/part64076/64076733/images/big/1.webp",
      description: "Оружие легендарного качества",
    },
    {
      id: 6,
      name: "Крылья ангела",
      price: 1200,
      image:
        "https://basket-04.wbbasket.ru/vol640/part64076/64076733/images/big/1.webp",
      description: "Позволяют вашему аватару летать",
    },
  ];

  const handlePurchase = (itemId) => {
    console.log("Purchased item:", itemId);
    // Purchase logic here
  };

  return (
    <LinearGradient colors={["#4169d1", "#9ba7be"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Магазин</Text>
          <View style={styles.coinContainer}>
            <Ionicons name="logo-bitcoin" size={24} color="#FFD700" />
            <Text style={styles.coinText}>1500</Text>
          </View>
        </View>

        <View style={styles.itemsGrid}>
          {shopItems.map((item) => (
            <ShopItem
              key={item.id.toString()}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
              onPress={() => handlePurchase(item.id)}
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
    paddingHorizontal: 15,
    paddingTop: 55,
    paddingBottom: 100,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFD700",
  },
  coinContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  coinText: {
    fontSize: 16,
    color: "#FFD700",
    marginLeft: 5,
  },
});

export default ShopScreen;

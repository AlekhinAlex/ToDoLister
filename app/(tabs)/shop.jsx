import { ScrollView, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import ShopItem from "../compnents/shopItem";

const ShopScreen = () => {
  /*This is onle examples of needed data, which will be received from db*/

  const shopItems = [
    {
      id: 1,
      name: "Золотая корона",
      price: 500,
      image: "https://i.imgur.com/JZw5M0n.png",
      description: "Эксклюзивный головной убор для вашего аватара",
    },
    {
      id: 2,
      name: "Синий плащ",
      price: 300,
      image: "https://i.imgur.com/8Q3aZ6j.png",
      description: "Стильный плащ для персонажа",
    },
    {
      id: 3,
      name: "Магический посох",
      price: 750,
      image: "https://i.imgur.com/KYQhW5x.png",
      description: "Увеличивает магическую силу",
    },
    {
      id: 4,
      name: "Редкий питомец",
      price: 1000,
      image: "https://i.imgur.com/L3qQZ2F.png",
      description: "Особый компаньон для вашего профиля",
    },
    {
      id: 5,
      name: "Эпический меч",
      price: 800,
      image: "https://i.imgur.com/mXJjZ1P.png",
      description: "Оружие легендарного качества",
    },
    {
      id: 6,
      name: "Крылья ангела",
      price: 1200,
      image: "https://i.imgur.com/vzQKjYy.png",
      description: "Позволяют вашему аватару летать",
    },
  ];

  const handlePurchase = (itemId) => {
    console.log("Purchased item:", itemId);
    // Purchase logic here
  };

  return (
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
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 55,
    paddingBottom: 100,
    backgroundColor: "#0A1F3A",
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

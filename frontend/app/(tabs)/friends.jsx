import React, { useState, useEffect } from "react";
import {
    View,
    Image,
    StyleSheet,
    useWindowDimensions,
    TouchableOpacity,
    FlatList,
} from "react-native";
import {
    Text,
    ActivityIndicator,
    IconButton,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { getToken, setToken } from "../lib/storage";
import { isTokenExpired, refreshAccessToken } from "../lib/authTokenManager";
import Toast from "react-native-toast-message";
import { API_BASE } from "../lib/api";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "react-native-paper";
import FormField from "../compnents/formField";
import ConfirmDeleteFriendModal from "../compnents/ConfirmDeleteFriendModal";

const FriendsScreen = () => {
    const { width: screenWidth } = useWindowDimensions();
    const isCompact = screenWidth > 764;

    const [activeTab, setActiveTab] = useState("friends");
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);

    const fetchFriendsData = async () => {
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

            // Получаем список друзей
            const friendsResponse = await fetch(`${API_BASE}/api/friendships/`, {
                headers: { Authorization: `Bearer ${token.access}` },
            });

            if (!friendsResponse.ok) throw new Error("Ошибка получения списка друзей");

            const friendsData = await friendsResponse.json();
            setFriends(friendsData);

            // Получаем ВХОДЯЩИЕ запросы в друзья
            const requestsResponse = await fetch(`${API_BASE}/api/friend-requests/?type=received`, {
                headers: { Authorization: `Bearer ${token.access}` },
            });

            if (!requestsResponse.ok) throw new Error("Ошибка получения запросов в друзья");

            const requestsData = await requestsResponse.json();
            setFriendRequests(requestsData);

        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
            Toast.show({
                type: "error",
                text1: "Ошибка загрузки",
                text2: error.message || "Пожалуйста, попробуйте позже",
            });
        } finally {
            setLoading(false);
        }
    };

    const searchUsers = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            let token = await getToken();

            const response = await fetch(`${API_BASE}/api/user-search/?q=${encodeURIComponent(searchQuery)}`, {
                headers: { Authorization: `Bearer ${token.access}` },
            });

            if (!response.ok) throw new Error("Ошибка поиска пользователей");

            const data = await response.json();
            setSearchResults(data);
            setActiveTab("search");
        } catch (error) {
            console.error("Ошибка поиска:", error);
            Toast.show({
                type: "error",
                text1: "Ошибка поиска",
                text2: error.message || "Попробуйте еще раз",
            });
        } finally {
            setSearching(false);
        }
    };

    const sendFriendRequest = async (userId) => {
        try {
            let token = await getToken();

            const response = await fetch(`${API_BASE}/api/friend-requests/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token.access}`,
                },
                body: JSON.stringify({ to_user: userId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Ошибка отправки запроса");
            }

            Toast.show({
                type: "success",
                text1: "Запрос отправлен",
            });

            setSearchResults(searchResults.filter(user => user.id !== userId));
        } catch (error) {
            console.error("Ошибка отправки запроса:", error);
            Toast.show({
                type: "error",
                text1: "Ошибка",
                text2: error.message || "Попробуйте снова",
            });
        }
    };

    const respondToFriendRequest = async (requestId, accept) => {
        try {
            let token = await getToken();

            const response = await fetch(`${API_BASE}/api/friend-requests/${requestId}/${accept ? 'accept' : 'reject'}/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token.access}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка ${accept ? 'принятия' : 'отклонения'} запроса`);
            }

            Toast.show({
                type: "success",
                text1: accept ? "Запрос принят" : "Запрос отклонен",
            });

            setFriendRequests(friendRequests.filter(req => req.id !== requestId));

            if (accept) {
                fetchFriendsData();
            }
        } catch (error) {
            console.error("Ошибка обработки запроса:", error);
            Toast.show({
                type: "error",
                text1: "Ошибка",
                text2: error.message || "Попробуйте снова",
            });
        }
    };

    const showDeleteConfirmation = (friendshipId, friend) => {
        setSelectedFriend({ id: friendshipId, ...friend });
        setDeleteModalVisible(true);
    };

    const removeFriend = async () => {
        if (!selectedFriend) return;

        try {
            let token = await getToken();

            const response = await fetch(`${API_BASE}/api/friendships/${selectedFriend.id}/`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token.access}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Ошибка удаления друга");
            }

            Toast.show({
                type: "success",
                text1: "Друг удален",
            });

            setFriends(friends.filter(f => f.id !== selectedFriend.id));
            setDeleteModalVisible(false);
            setSelectedFriend(null);
        } catch (error) {
            console.error("Ошибка удаления друга:", error);
            Toast.show({
                type: "error",
                text1: "Ошибка",
                text2: error.message || "Попробуйте снова",
            });
            setDeleteModalVisible(false);
            setSelectedFriend(null);
        }
    };

    useEffect(() => {
        fetchFriendsData();
    }, []);

    const renderFriendItem = ({ item }) => (
        <View style={styles.friendItem}>
            <Image
                source={{ uri: item.friend.avatar || "https://i.imgur.com/mCHMpLT.png" }}
                style={styles.avatar}
            />
            <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{item.friend.username}</Text>
                <Text style={styles.friendRank}>
                    {item.rank?.name || "Новичок"} • {item.completed_tasks || 0} задач
                </Text>
            </View>
            <IconButton
                icon="account-remove"
                iconColor="#EF4444"
                size={20}
                onPress={() => showDeleteConfirmation(item.id, item.friend)}
            />
        </View>
    );

    const renderRequestItem = ({ item }) => (
        <View style={styles.requestItem}>
            <Image
                source={{ uri: item.from_user.avatar || "https://i.imgur.com/mCHMpLT.png" }}
                style={styles.avatar}
            />
            <View style={styles.requestInfo}>
                <Text style={styles.requestName}>{item.from_user.username}</Text>
                <Text style={styles.requestDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>
            <View style={styles.requestActions}>
                <IconButton
                    icon="check"
                    iconColor="#10B981"
                    size={20}
                    onPress={() => respondToFriendRequest(item.id, true)}
                />
                <IconButton
                    icon="close"
                    iconColor="#EF4444"
                    size={20}
                    onPress={() => respondToFriendRequest(item.id, false)}
                />
            </View>
        </View>
    );

    const handleFriendAction = (user) => {
        switch (user.friendship_status) {
            case 'can_add':
                sendFriendRequest(user.id);
                break;
            case 'request_received':
                Toast.show({
                    type: 'info',
                    text1: 'Перейдите во вкладку "Запросы"',
                    text2: 'Чтобы ответить на входящий запрос',
                });
                break;
            default:
                break;
        }
    };

    const renderSearchItem = ({ item }) => {
        let buttonText = "Добавить";
        let buttonDisabled = false;
        let buttonColor = '#6D28D9';

        switch (item.friendship_status) {
            case 'friend':
                buttonText = "Уже в друзьях";
                buttonDisabled = true;
                buttonColor = '#374151';
                break;
            case 'request_sent':
                buttonText = "Запрос отправлен";
                buttonDisabled = true;
                buttonColor = '#F59E0B';
                break;
            case 'request_received':
                buttonText = "Ответить на запрос";
                buttonDisabled = false;
                buttonColor = '#10B981';
                break;
            case 'can_add':
            default:
                buttonText = "Добавить";
                buttonDisabled = false;
                buttonColor = 'rgba(255,255,255,.1)';
                break;
        }

        return (
            <View style={styles.searchItem}>
                <Image
                    source={{ uri: item.avatar || "https://i.imgur.com/mCHMpLT.png" }}
                    style={styles.avatar}
                />
                <View style={styles.searchInfo}>
                    <Text style={styles.searchName}>{item.username}</Text>
                    <Text style={styles.searchEmail}>{item.email}</Text>
                </View>
                <Button
                    mode="contained"
                    onPress={() => handleFriendAction(item)}
                    style={[styles.addButton, { backgroundColor: buttonColor }]}
                    disabled={buttonDisabled}
                >
                    {buttonText}
                </Button>
            </View>
        );
    };
    if (loading) {
        return (
            <LinearGradient colors={["#0f0c29", "#302b63", "#24243e"]} style={[styles.gradient, styles.center]}>
                <ActivityIndicator animating={true} color="#FFFFFF" size="large" />
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={["#0f0c29", "#302b63", "#24243e"]} style={styles.gradient}>
            <View style={styles.container}>
                {/* Заголовок */}
                <View style={styles.header}>
                    <Ionicons name="people" size={32} color="#fff" />
                    <Text style={styles.headerTitle}>Друзья</Text>
                </View>

                {/* Поиск - показываем только во вкладках "Друзья" и "Поиск" */}
                {(activeTab === "friends" || activeTab === "search") && (
                    <View style={styles.searchContainer}>
                        <FormField
                            name="Поиск пользователей"
                            value={searchQuery}
                            placeholder="Введите имя или email..."
                            iconName="search"
                            handleChangeText={setSearchQuery}
                            onSubmitEditing={searchUsers}
                            returnKeyType="search"
                        />
                        <IconButton
                            icon="magnify"
                            iconColor="#fff"
                            size={24}
                            onPress={searchUsers}
                            loading={searching}
                            style={styles.searchButton}
                        />
                    </View>
                )}

                {/* Табы */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "friends" && styles.activeTab]}
                        onPress={() => setActiveTab("friends")}
                    >
                        <Text style={[styles.tabText, activeTab === "friends" && styles.activeTabText]}>
                            Друзья ({friends.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "requests" && styles.activeTab]}
                        onPress={() => setActiveTab("requests")}
                    >
                        <Text style={[styles.tabText, activeTab === "requests" && styles.activeTabText]}>
                            Запросы ({friendRequests.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "search" && styles.activeTab]}
                        onPress={() => setActiveTab("search")}
                    >
                        <Text style={[styles.tabText, activeTab === "search" && styles.activeTabText]}>
                            Поиск
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Контент */}
                <View style={styles.content}>
                    {activeTab === "friends" && (
                        friends.length > 0 ? (
                            <FlatList
                                data={friends}
                                renderItem={renderFriendItem}
                                keyExtractor={item => item.id.toString()}
                            />
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="people-outline" size={64} color="rgba(255,255,255,0.3)" />
                                <Text style={styles.emptyText}>У вас пока нет друзей</Text>
                                <Text style={styles.emptySubtext}>
                                    Найдите друзей с помощью поиска и отправьте им запросы
                                </Text>
                            </View>
                        )
                    )}

                    {activeTab === "requests" && (
                        friendRequests.length > 0 ? (
                            <FlatList
                                data={friendRequests}
                                renderItem={renderRequestItem}
                                keyExtractor={item => item.id.toString()}
                            />
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="mail-open-outline" size={64} color="rgba(255,255,255,0.3)" />
                                <Text style={styles.emptyText}>Нет активных запросов</Text>
                            </View>
                        )
                    )}

                    {activeTab === "search" && (
                        searchResults.length > 0 ? (
                            <FlatList
                                data={searchResults}
                                renderItem={renderSearchItem}
                                keyExtractor={item => item.id.toString()}
                            />
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="search-outline" size={64} color="rgba(255,255,255,0.3)" />
                                <Text style={styles.emptyText}>Начните поиск пользователей</Text>
                                <Text style={styles.emptySubtext}>
                                    Введите имя или email пользователя в поле поиска
                                </Text>
                            </View>
                        )
                    )}
                </View>

                {/* Модальное окно подтверждения удаления */}
                <ConfirmDeleteFriendModal
                    visible={deleteModalVisible}
                    onConfirm={removeFriend}
                    onCancel={() => {
                        setDeleteModalVisible(false);
                        setSelectedFriend(null);
                    }}
                    friendName={selectedFriend?.username || "друга"}
                />
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    center: {
        justifyContent: "center",
        alignItems: "center"
    },
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    searchButton: {
        marginTop: 25, // Выравниваем с FormField
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: 'rgba(254, 254, 254, 0.1)',
    },
    tabText: {
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        marginBottom: 10,
    },
    requestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        marginBottom: 10,
    },
    searchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        marginBottom: 10,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    friendInfo: {
        flex: 1,
    },
    friendName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    friendRank: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },
    requestInfo: {
        flex: 1,
    },
    requestName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    requestDate: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },
    requestActions: {
        flexDirection: 'row',
    },
    searchInfo: {
        flex: 1,
    },
    searchName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    searchEmail: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },
    addButton: {
        backgroundColor: '#6D28D9',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        textAlign: 'center',
    },
});

export default FriendsScreen;
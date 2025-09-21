import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE } from '../lib/api';
import { getToken } from '../lib/storage';

const CollaborationNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const scaleAnim = useState(new Animated.Value(0.8))[0];
    const opacityAnim = useState(new Animated.Value(0))[0];

    const fetchNotifications = async () => {
        try {
            const { access } = await getToken();
            const response = await fetch(`${API_BASE}/api/collaboration-invitations/pending-invitations/`, {
                headers: {
                    Authorization: `Bearer ${access}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
                setUnreadCount(data.length);

                // Анимация появления новых уведомлений
                if (data.length > 0) {
                    Animated.sequence([
                        Animated.spring(scaleAnim, {
                            toValue: 1.1,
                            friction: 3,
                            useNativeDriver: true,
                        }),
                        Animated.spring(scaleAnim, {
                            toValue: 1,
                            friction: 6,
                            useNativeDriver: true,
                        })
                    ]).start();
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error);
        } finally {
            setLoading(false);
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    };

    const respondToInvitation = async (invitationId, accept) => {
        try {
            const { access } = await getToken();
            const response = await fetch(`${API_BASE}/api/collaboration-invitations/${invitationId}/respond-invitation/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${access}`,
                },
                body: JSON.stringify({ accept }),
            });

            if (response.ok) {
                // Анимация удаления уведомления
                setNotifications(prev => prev.filter(item => item.id !== invitationId));
                setUnreadCount(prev => prev - 1);
            }
        } catch (error) {
            console.error('Ошибка ответа на приглашение:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, []);

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const renderNotificationItem = ({ item, index }) => (
        <Animated.View
            style={[
                styles.notificationItem,
                {
                    opacity: opacityAnim,
                    transform: [{
                        translateY: opacityAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0]
                        })
                    }]
                }
            ]}
        >
            <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.glassCard}
            >
                {/* Аватар и основная информация */}
                <View style={styles.notificationHeader}>
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={['#6a11cb', '#2575fc']}
                            style={styles.avatarGradient}
                        >
                            <Text style={styles.avatarText}>
                                {item.invited_by?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </Text>
                        </LinearGradient>
                    </View>

                    <View style={styles.notificationContent}>
                        <Text style={styles.notificationTitle}>
                            Приглашение к сотрудничеству
                        </Text>
                        <Text style={styles.notificationText}>
                            <Text style={styles.username}>{item.invited_by?.username || 'Пользователь'}</Text>
                            {' '}приглашает вас выполнить задачу
                        </Text>
                        <Text style={styles.taskTitle}>"{item.task?.title || 'Неизвестная задача'}"</Text>
                    </View>
                </View>

                {/* Кнопки действий */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.button, styles.acceptButton]}
                        onPress={() => respondToInvitation(item.id, true)}
                    >
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="checkmark" size={18} color="#fff" />
                            <Text style={styles.buttonText}>Принять</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.rejectButton]}
                        onPress={() => respondToInvitation(item.id, false)}
                    >
                        <LinearGradient
                            colors={['#EF4444', '#DC2626']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="close" size={18} color="#fff" />
                            <Text style={styles.buttonText}>Отклонить</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            {/* Заголовок с бейджем */}
            <TouchableOpacity
                style={styles.header}
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <LinearGradient
                    colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.1)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerContent}>
                        <Ionicons
                            name="people"
                            size={22}
                            color="#fff"
                            style={styles.headerIcon}
                        />
                        <Text style={styles.headerTitle}>
                            Приглашения к сотрудничеству
                        </Text>

                        {unreadCount > 0 && (
                            <Animated.View
                                style={[
                                    styles.badge,
                                    { transform: [{ scale: scaleAnim }] }
                                ]}
                            >
                                <LinearGradient
                                    colors={['#FF6B6B', '#EE5A52']}
                                    style={styles.badgeGradient}
                                >
                                    <Text style={styles.badgeText}>{unreadCount}</Text>
                                </LinearGradient>
                            </Animated.View>
                        )}

                        <Ionicons
                            name={expanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color="rgba(255,255,255,0.7)"
                            style={styles.chevron}
                        />
                    </View>
                </LinearGradient>
            </TouchableOpacity>

            {/* Содержимое уведомлений */}
            {expanded && (
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: opacityAnim,
                            transform: [{
                                translateY: opacityAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-10, 0]
                                })
                            }]
                        }
                    ]}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <Ionicons name="refresh" size={24} color="rgba(255,255,255,0.5)" />
                            <Text style={styles.loadingText}>Загрузка...</Text>
                        </View>
                    ) : notifications.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons
                                name="notifications-off-outline"
                                size={40}
                                color="rgba(255,255,255,0.3)"
                            />
                            <Text style={styles.emptyText}>
                                Нет активных приглашений
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={notifications}
                            keyExtractor={item => item.id.toString()}
                            renderItem={renderNotificationItem}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 12,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    headerGradient: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerIcon: {
        marginRight: 12,
    },
    headerTitle: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    badge: {
        marginHorizontal: 8,
    },
    badgeGradient: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    chevron: {
        marginLeft: 8,
    },
    content: {
        maxHeight: Dimensions.get('window').height * 0.4,
    },
    listContent: {
        padding: 16,
        gap: 12,
    },
    notificationItem: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 8,
    },
    glassCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatarGradient: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    notificationText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 13,
        lineHeight: 18,
    },
    username: {
        color: '#ffffff',
        fontWeight: '600',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 30,
        paddingHorizontal: 10,
        paddingVertical: 1,
    },
    taskTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
        fontStyle: 'italic',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    button: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonGradient: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    acceptButton: {
        backgroundColor: 'transparent',
    },
    rejectButton: {
        backgroundColor: 'transparent',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 12,
    },
    loadingText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
    },
});

export default CollaborationNotifications;
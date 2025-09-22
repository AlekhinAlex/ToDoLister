import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE } from '../lib/api';
import { getToken } from '../lib/storage';

const CollaborationNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isPanelVisible, setIsPanelVisible] = useState(false);

    // Анимации для панели
    const slideAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const isTablet = screenWidth >= 768;
    const isSmallPhone = screenWidth < 375;

    // Адаптивные размеры
    const panelWidth = isTablet ? screenWidth * 0.4 : screenWidth * 0.9;
    const maxPanelHeight = isTablet ? screenHeight * 0.8 : screenHeight * 0.85;
    const panelPosition = isTablet ? 'right' : 'bottom';

    // PanResponder для свайпа закрытия
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (evt, gestureState) => {
                if (panelPosition === 'bottom' && gestureState.dy > 50) {
                    closePanel();
                } else if (panelPosition === 'right' && gestureState.dx > 50) {
                    closePanel();
                }
            },
        })
    ).current;

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

                // Анимация пульсации при новых уведомлениях
                if (data.length > unreadCount && data.length > 0) {
                    Animated.sequence([
                        Animated.timing(pulseAnim, {
                            toValue: 1.5,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(pulseAnim, {
                            toValue: 1,
                            duration: 200,
                            useNativeDriver: true,
                        })
                    ]).start();
                }
                setUnreadCount(data.length);
            }
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error);
        } finally {
            setLoading(false);
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
                const itemOpacity = new Animated.Value(1);
                Animated.timing(itemOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    setNotifications(prev => prev.filter(item => item.id !== invitationId));
                    setUnreadCount(prev => prev - 1);
                });
            }
        } catch (error) {
            console.error('Ошибка ответа на приглашение:', error);
        }
    };

    const openPanel = () => {
        setIsPanelVisible(true);
        Animated.parallel([
            panelPosition === 'bottom'
                ? Animated.spring(slideAnim, {
                    toValue: 1,
                    friction: 8,
                    useNativeDriver: true,
                })
                : Animated.spring(slideAnim, {
                    toValue: 1,
                    friction: 8,
                    useNativeDriver: true,
                }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();
    };

    const closePanel = () => {
        Animated.parallel([
            panelPosition === 'bottom'
                ? Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 8,
                    useNativeDriver: true,
                })
                : Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 8,
                    useNativeDriver: true,
                }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            setIsPanelVisible(false);
        });
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

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
                colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.08)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.glassCard}
            >
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

                        {/* Дополнительная информация */}
                        <View style={styles.taskMeta}>
                            {item.task?.difficulty && (
                                <View style={styles.metaItem}>
                                    <Ionicons name="flash" size={12} color="#FFD700" />
                                    <Text style={styles.metaText}>
                                        {['Легкая', 'Средняя', 'Сложная'][item.task.difficulty - 1] || 'Неизвестно'}
                                    </Text>
                                </View>
                            )}
                            {item.task?.reward_xp > 0 && (
                                <View style={styles.metaItem}>
                                    <Ionicons name="star" size={12} color="#4FC3F7" />
                                    <Text style={styles.metaText}>+{item.task.reward_xp} XP</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.button, styles.acceptButton]}
                        onPress={() => respondToInvitation(item.id, true)}
                    >
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            style={styles.buttonGradient}
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
                        >
                            <Ionicons name="close" size={18} color="#fff" />
                            <Text style={styles.buttonText}>Отклонить</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </Animated.View>
    );

    // Анимационные преобразования для разных позиций
    const getPanelTransform = () => {
        if (panelPosition === 'bottom') {
            return [{
                translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [maxPanelHeight, 0]
                })
            }];
        } else {
            return [{
                translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [panelWidth, 0]
                })
            }];
        }
    };

    const getPanelStyle = () => {
        const baseStyle = {
            width: panelPosition === 'bottom' ? screenWidth : panelWidth,
            height: panelPosition === 'bottom' ? maxPanelHeight : screenHeight,
            opacity: opacityAnim,
            transform: getPanelTransform()
        };

        if (panelPosition === 'bottom') {
            return [styles.panelBottom, baseStyle];
        } else {
            return [styles.panelRight, baseStyle];
        }
    };

    return (
        <>
            {/* Кнопка уведомлений */}
            <TouchableOpacity
                style={[
                    styles.notificationButton,
                    {
                        right: isTablet ? 60 : 60,
                        top: isTablet ? 20 : 20,
                        width: isTablet ? 20 : 20,
                        height: isTablet ? 20 : 20,
                    }
                ]}
                onPress={openPanel}
                activeOpacity={0.8}
            >
                <Animated.View
                    style={{
                        transform: [{ scale: pulseAnim }]
                    }}
                >
                    <LinearGradient
                        colors={['#6a11cb', '#2575fc']}
                        style={[
                            styles.buttonGradient,
                            {
                                width: isTablet ? 60 : 50,
                                height: isTablet ? 60 : 50,
                                borderRadius: isTablet ? 30 : 25,
                            }
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons
                            name="people"
                            size={isTablet ? 26 : 22}
                            color="#fff"
                        />

                        {unreadCount > 0 && (
                            <Animated.View
                                style={[
                                    styles.badge,
                                    {
                                        transform: [{ scale: scaleAnim }],
                                        top: isTablet ? -8 : -5,
                                        right: isTablet ? -8 : -5,
                                    }
                                ]}
                            >
                                <LinearGradient
                                    colors={['#FF6B6B', '#EE5A52']}
                                    style={[
                                        styles.badgeGradient,
                                        {
                                            width: isTablet ? 24 : 20,
                                            height: isTablet ? 24 : 20,
                                            borderRadius: isTablet ? 12 : 10,
                                        }
                                    ]}
                                >
                                    <Text style={[
                                        styles.badgeText,
                                        { fontSize: isTablet ? 12 : 10 }
                                    ]}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </Text>
                                </LinearGradient>
                            </Animated.View>
                        )}
                    </LinearGradient>
                </Animated.View>
            </TouchableOpacity>

            {/* Модальное окно */}
            <Modal
                visible={isPanelVisible}
                transparent
                animationType="none"
                onRequestClose={closePanel}
                statusBarTranslucent={true}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={closePanel}
                >
                    <Animated.View
                        style={getPanelStyle()}
                        {...panResponder.panHandlers}
                    >
                        {/* Индикатор свайпа для мобильных */}
                        {panelPosition === 'bottom' && (
                            <View style={styles.swipeIndicatorContainer}>
                                <View style={styles.swipeIndicator} />
                            </View>
                        )}

                        {/* Заголовок панели */}
                        <LinearGradient
                            colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                            style={styles.panelHeader}
                        >
                            <View style={styles.panelHeaderContent}>
                                <View style={styles.titleContainer}>
                                    <Ionicons name="people" size={isTablet ? 24 : 20} color="#fff" />
                                    <Text style={[
                                        styles.panelTitle,
                                        { fontSize: isTablet ? 20 : 16 }
                                    ]}>
                                        Приглашения ({unreadCount})
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={closePanel}
                                    style={styles.closeButton}
                                >
                                    <Ionicons
                                        name="close"
                                        size={isTablet ? 28 : 22}
                                        color="rgba(255,255,255,0.7)"
                                    />
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>

                        {/* Содержимое уведомлений */}
                        <View style={[
                            styles.panelContent,
                            { maxHeight: panelPosition === 'bottom' ? maxPanelHeight - 100 : maxPanelHeight }
                        ]}>
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <Animated.View
                                        style={{
                                            transform: [{
                                                rotate: opacityAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0deg', '360deg']
                                                })
                                            }]
                                        }}
                                    >
                                        <Ionicons name="refresh" size={32} color="rgba(255,255,255,0.5)" />
                                    </Animated.View>
                                    <Text style={styles.loadingText}>Загрузка...</Text>
                                </View>
                            ) : notifications.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Ionicons
                                        name="notifications-off-outline"
                                        size={isTablet ? 60 : 40}
                                        color="rgba(255,255,255,0.3)"
                                    />
                                    <Text style={styles.emptyText}>
                                        Нет активных приглашений
                                    </Text>
                                    <Text style={styles.emptySubtext}>
                                        Новые приглашения появятся здесь
                                    </Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={notifications}
                                    keyExtractor={item => item.id.toString()}
                                    renderItem={renderNotificationItem}
                                    contentContainerStyle={styles.listContent}
                                    showsVerticalScrollIndicator={false}
                                    fadingEdgeLength={50}
                                />
                            )}
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    // Стили для кнопки уведомлений
    notificationButton: {
        position: 'absolute',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonGradient: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
    },
    badgeGradient: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#302b63',
    },
    badgeText: {
        color: '#fff',
        fontWeight: 'bold',
    },

    // Стили для оверлея
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },

    // Стили для панели (адаптивные)
    panelBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: '#0f0c29',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    panelRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#0f0c29',
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(255, 255, 255, 0.1)',
    },

    // Индикатор свайпа
    swipeIndicatorContainer: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    swipeIndicator: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
    },

    // Заголовок панели
    panelHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    panelHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    panelTitle: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 10,
    },
    closeButton: {
        padding: 4,
    },

    // Контент панели
    panelContent: {
        flex: 1,
    },
    listContent: {
        paddingVertical: 16,
        paddingHorizontal: 8,
    },

    // Элементы уведомлений
    notificationItem: {
        marginHorizontal: 8,
        marginVertical: 6,
        borderRadius: 16,
        overflow: 'hidden',
    },
    glassCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
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
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
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
    },
    taskTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
        fontStyle: 'italic',
    },
    taskMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    metaText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 11,
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    button: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        minHeight: 44,
    },
    buttonGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },

    // Состояния загрузки и пустого состояния
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        marginTop: 12,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 16,
        fontWeight: '500',
        marginTop: 12,
        textAlign: 'center',
    },
    emptySubtext: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
    },
});

export default CollaborationNotifications;
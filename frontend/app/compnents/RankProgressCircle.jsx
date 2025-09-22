import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
    Dimensions,
    Image, // Добавьте этот импорт
    TouchableOpacity // Добавьте для интерактивности
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const RankProgressCircle = ({ xp, rank, nextRank, size = 60, showOnMobile = false }) => {
    const isSmallScreen = Dimensions.get('window').width < 768;
    const [showTooltip, setShowTooltip] = React.useState(false);

    // Если экран маленький и не показываем на мобилках - возвращаем null
    if (isSmallScreen && !showOnMobile) {
        return null;
    }

    const totalXP = nextRank ? nextRank.required_xp - (rank?.required_xp || 0) : 100;
    const currentXP = xp - (rank?.required_xp || 0);
    const progress = nextRank ? Math.min(Math.max(currentXP / totalXP, 0), 1) : 1;

    const progressAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const tooltipAnim = useRef(new Animated.Value(0)).current;

    // Анимация прогресса
    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 1500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();
    }, [progress]);

    // Анимация тултипа
    useEffect(() => {
        Animated.timing(tooltipAnim, {
            toValue: showTooltip ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [showTooltip]);

    const handlePress = () => {
        setShowTooltip(!showTooltip);
    };

    const circumference = 2 * Math.PI * (size / 2 - 3);
    const strokeDashoffset = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, 0],
    });

    const tooltipOpacity = tooltipAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
    });

    const tooltipTranslateY = tooltipAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-10, 0]
    });

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity
                onPress={handlePress}
                style={[
                    styles.container,
                    { width: size, height: size }
                ]}
            >
                {/* Фоновый круг */}
                <View style={[styles.circle, styles.backgroundCircle, { width: size, height: size }]}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                        style={styles.circle}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                </View>

                {/* Прогресс круг */}
                <View style={[styles.circle, { width: size, height: size }]}>
                    <Animated.View
                        style={[
                            styles.progressCircle,
                            {
                                width: size,
                                height: size,
                                borderWidth: 3,
                                borderRadius: size / 2,
                                borderLeftColor: '#FFD700',
                                borderBottomColor: '#FFA500',
                                borderRightColor: '#FFD700',
                                borderTopColor: '#FFA500',
                                transform: [{ rotate: '-45deg' }],
                                borderDasharray: circumference,
                                borderDashoffset: strokeDashoffset,
                            },
                        ]}
                    />
                </View>

                {/* Содержимое круга */}
                <View style={[styles.content, { width: size - 20, height: size - 20 }]}>
                    {rank?.image ? (
                        <Image
                            source={{ uri: rank.image }}
                            style={[styles.rankImage, { width: size * 0.5, height: size * 0.5 }]}
                            resizeMode="contain"
                        />
                    ) : (
                        <Ionicons
                            name="trophy"
                            size={size * 0.4}
                            color="#FFD700"
                        />
                    )}

                    {/* Уровень в маленьком кружке */}
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>
                            {rank?.level || (rank?.required_xp ? Math.floor((xp || 0) / 100) + 1 : 1)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Тулутип */}
            <Animated.View style={[
                styles.tooltip,
                {
                    opacity: tooltipOpacity,
                    transform: [{ translateY: tooltipTranslateY }]
                }
            ]}>
                <Text style={styles.tooltipText}>
                    {rank?.name || 'Новичок'}
                </Text>
                <Text style={styles.tooltipSubtext}>
                    {Math.round(progress * 100)}% до след. уровня
                </Text>
                <Text style={styles.tooltipSubtext}>
                    XP: {currentXP}/{totalXP}
                </Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
        alignItems: 'center',
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    circle: {
        position: 'absolute',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundCircle: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    progressCircle: {
        position: 'absolute',
        borderStyle: 'solid',
        backgroundColor: 'transparent',
    },
    content: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
    },
    rankImage: {
        borderRadius: 10,
    },
    levelBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#4169d1',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1e1e2e',
    },
    levelText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    tooltip: {
        position: 'absolute',
        top: '100%',
        marginTop: 8,
        backgroundColor: 'rgba(30, 30, 46, 0.95)',
        padding: 12,
        borderRadius: 8,
        minWidth: 140,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        zIndex: 1000,
    },
    tooltipText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 4,
    },
    tooltipSubtext: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10,
        textAlign: 'center',
    },
});

export default RankProgressCircle;
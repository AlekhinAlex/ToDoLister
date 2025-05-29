import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RankDisplay = ({ xp, rank, nextRank, money = 0, showLevelUp = false, onLevelUpComplete }) => {
    const totalXP = nextRank ? nextRank.required_xp - (rank?.required_xp || 0) : 100;
    const currentXP = xp - (rank?.required_xp || 0);
    const progress = nextRank ? Math.min(Math.max(currentXP / totalXP, 0), 1) : 1;

    // Анимационные значения
    const [scaleAnim] = useState(new Animated.Value(1));
    const [opacityAnim] = useState(new Animated.Value(1));
    const [progressAnim] = useState(new Animated.Value(progress));
    const [isLevelingUp, setIsLevelingUp] = useState(false);
    const [currentDisplayRank, setCurrentDisplayRank] = useState(rank);
    const [currentDisplayXP, setCurrentDisplayXP] = useState(xp);

    // Эффект для анимации прогресса
    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 1000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();
    }, [progress]);

    // Эффект для анимации повышения уровня
    useEffect(() => {
        if (showLevelUp && nextRank && xp >= nextRank.required_xp) {
            setIsLevelingUp(true);

            // Анимация повышения уровня
            Animated.sequence([
                // Увеличение и мерцание
                Animated.parallel([
                    Animated.timing(scaleAnim, {
                        toValue: 1.2,
                        duration: 300,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0.7,
                        duration: 300,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),
                // Возврат к нормальному состоянию с новым рангом
                Animated.parallel([
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 300,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 1,
                        duration: 300,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),
            ]).start(() => {
                setCurrentDisplayRank(nextRank);
                setCurrentDisplayXP(xp);
                setIsLevelingUp(false);
                if (onLevelUpComplete) onLevelUpComplete();
            });
        } else {
            setCurrentDisplayRank(rank);
            setCurrentDisplayXP(xp);
        }
    }, [showLevelUp, rank, nextRank, xp]);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#ffffff20", "#ffffff05"]}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Ранг с иконкой */}
                <Animated.View style={[styles.rankRow, {
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                }]}>
                    {currentDisplayRank?.image && (
                        <Image
                            source={{ uri: currentDisplayRank.image }}
                            style={styles.rankImage}
                            resizeMode="contain"
                        />
                    )}
                    <Text style={styles.rankText}>
                        {currentDisplayRank?.name || "Без ранга"}
                        {isLevelingUp && " ↑"}
                    </Text>
                </Animated.View>

                {/* Деньги */}
                <View style={styles.row}>
                    <MaterialCommunityIcons name="cash" size={30} color="#5df26d" />
                    <Text style={styles.moneyText}>{money}</Text>
                </View>

                {/* XP и прогресс */}
                <Text style={styles.xpText}>
                    XP: {currentDisplayXP} {nextRank ? ` / ${nextRank.required_xp}` : ""}
                </Text>

                <View style={styles.progressBar}>
                    <Animated.View style={[styles.progressFill, {
                        width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                        })
                    }]} />
                </View>

                {nextRank && !isLevelingUp && (
                    <Text style={styles.nextRankText}>
                        До ранга «{nextRank.name}» осталось {Math.max(0, nextRank.required_xp - currentDisplayXP)} XP
                    </Text>
                )}

                {isLevelingUp && (
                    <Text style={styles.levelUpText}>
                        Новый уровень!
                    </Text>
                )}
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        minWidth: 380,
        maxWidth: 280,
    },
    card: {
        padding: 12,
        borderRadius: 16,
        borderColor: "#ffffff40",
        borderWidth: 1,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
    rankRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    rankImage: {
        width: 30,
        height: 30,
        marginRight: 6,
        borderRadius: 4,
    },
    rankText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        marginLeft: 6,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    moneyText: {
        color: "#5df26d",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    xpText: {
        color: "#eee",
        fontSize: 14,
        marginBottom: 6,
    },
    progressBar: {
        height: 8,
        backgroundColor: "#ffffff30",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 6,
    },
    progressFill: {
        height: 8,
        backgroundColor: "#FFD700",
    },
    nextRankText: {
        color: "#fff",
        fontSize: 13,
        opacity: 0.8,
    },
    levelUpText: {
        color: "#FFD700",
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 5,
    },
});

export default RankDisplay;
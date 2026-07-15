import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { useStore } from '../src/store/useStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import PersonalGoalsSVG from '../assets/personal-goals.svg';
import BusinessPlanSVG from '../assets/business-plan.svg';
import AchievementSVG from '../assets/achievement.svg';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Build Habits\nThat Last',
    subtitle: 'Track your progress, stay consistent, and achieve your goals.',
    Illustration: PersonalGoalsSVG
  },
  {
    id: '2',
    title: 'Track. Improve.\nSucceed.',
    subtitle: 'Simple tools to help you focus on what matters most.',
    Illustration: BusinessPlanSVG
  },
  {
    id: '3',
    title: 'Small Steps,\nBig Changes',
    subtitle: 'Celebrate every win and become your best self every day.',
    Illustration: AchievementSVG
  }
];



export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;

  const goNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      router.push('/(auth)/login');
    }
  };

  const renderItem = ({ item }: { item: typeof slides[0] }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.imageContainer}>
          <item.Illustration width="100%" height="100%" />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />
      
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                { backgroundColor: index === currentIndex ? theme.primary : theme.border },
                index === currentIndex && styles.dotActive
              ]} 
            />
          ))}
        </View>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }]} 
          onPress={goNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: height * 0.05,
    paddingBottom: height * 0.05,
  },
  imageContainer: {
    width: '100%',
    height: height * 0.38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loaderPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  textContainer: {
    width: '100%',
    paddingHorizontal: 8,
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: 32,
    textAlign: 'left',
    width: '100%',
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
    textAlign: 'left',
    width: '100%',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    minWidth: 130,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontFamily: typography.fonts.semiBold,
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
  }
});
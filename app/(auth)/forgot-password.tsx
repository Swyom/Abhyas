import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { useStore } from '../../src/store/useStore';
import { Ionicons } from '@expo/vector-icons';
import { resetPassword } from '../../src/services/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const isDarkMode = useStore((state) => state.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(email.trim());
    setLoading(false);
    
    if (result.success) {
      Alert.alert(
        'Success', 
        'If this email is registered, you will receive a link to reset your password shortly.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      let errorMessage = 'Could not send reset email. Please try again later.';
      if (result.error) {
        if (result.error.includes('auth/invalid-email') || result.error.includes('invalid-email')) {
          errorMessage = 'The email address is badly formatted.';
        } else if (result.error.includes('auth/user-not-found') || result.error.includes('user-not-found')) {
          errorMessage = 'There is no account registered with this email.';
        } else if (result.error.includes('network-request-failed')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = result.error;
        }
      }
      Alert.alert('Reset Failed', errorMessage);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Forgot Password?</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.icon}>
                <Ionicons name="mail-outline" size={20} color={theme.textSecondary} />
              </View>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]} 
              onPress={handleReset}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xxxl,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 32,
    paddingHorizontal: 16,
    height: 56,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: typography.fonts.semiBold,
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
  },
});

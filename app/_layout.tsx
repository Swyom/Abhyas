import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { Inter_400Regular, Inter_500Medium } from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { useStore } from "../src/store/useStore";
import { ThemeProvider, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../src/services/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { scheduleHabitReminders } from "../src/services/notifications";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_500Medium,
  });

  const isDarkMode = useStore((state) => state.isDarkMode);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const isAuthReady = useStore((state) => state.isAuthReady);
  const setAuthReady = useStore((state) => state.setAuthReady);
  
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from firestore
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          const baseUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          };
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({ ...baseUser, ...userData });
          } else {
            setUser(baseUser);
          }
          
          // Schedule local notifications for habit reminders
          scheduleHabitReminders();
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        }
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isIndex = segments.length === 0 || (segments.length === 1 && segments[0] === 'index');

    if (user && (isIndex || inAuthGroup)) {
      // User is logged in, redirect away from onboarding and auth screens
      router.replace('/(tabs)/home');
    } else if (!user && !isIndex && !inAuthGroup) {
      // User is not logged in, redirect to onboarding if trying to access protected screens
      router.replace('/');
    }
  }, [user, isAuthReady, segments, fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded && isAuthReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isAuthReady]);

  if (!fontsLoaded || !isAuthReady) {
    return null;
  }

  return (
    <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

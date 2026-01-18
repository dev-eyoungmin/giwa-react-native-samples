import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '../components/useColorScheme';
import { GiwaProvider } from 'giwa-react-native-wallet';
import { LanguageProvider } from '../lib/i18n';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [providerError, setProviderError] = useState<Error | null>(null);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (providerError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>SDK Error</Text>
        <Text style={{ color: 'red', textAlign: 'center' }}>{providerError.message}</Text>
      </View>
    );
  }

  return <RootLayoutNav onError={setProviderError} />;
}

function RootLayoutNav({ onError }: { onError: (error: Error) => void }) {
  const colorScheme = useColorScheme();

  return (
    <LanguageProvider>
      <GiwaProvider
        config={{ network: 'testnet' }}
        onError={onError}
      >
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </GiwaProvider>
    </LanguageProvider>
  );
}

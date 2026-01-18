import 'react-native-get-random-values';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { GiwaProvider } from 'giwa-react-native-wallet';

import { LanguageProvider, useLanguage, Language } from './src/lib/i18n';
import HomeScreen from './src/screens/HomeScreen';
import TokensScreen from './src/screens/TokensScreen';
import TransferScreen from './src/screens/TransferScreen';
import ServicesScreen from './src/screens/ServicesScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function EnvironmentBadge() {
  return (
    <View style={styles.envBadge}>
      <Text style={styles.envText}>RN CLI</Text>
    </View>
  );
}

function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLang: Language = language === 'ko' ? 'en' : 'ko';
    setLanguage(newLang);
  };

  return (
    <TouchableOpacity style={styles.langToggle} onPress={toggleLanguage}>
      <Text style={[styles.langText, language === 'ko' && styles.langTextActive]}>KO</Text>
      <Text style={styles.langDivider}>/</Text>
      <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>EN</Text>
    </TouchableOpacity>
  );
}

function TabNavigator() {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarLabelStyle: { fontSize: 12 },
        headerLeft: () => <EnvironmentBadge />,
        headerRight: () => <LanguageToggle />,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t.tabHome,
          tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Tokens"
        component={TokensScreen}
        options={{
          title: t.tabAssets,
          tabBarIcon: ({ color }) => <Icon name="circle" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Transfer"
        component={TransferScreen}
        options={{
          title: t.tabTransfer,
          tabBarIcon: ({ color }) => <Icon name="send" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={{
          title: t.tabServices,
          tabBarIcon: ({ color }) => <Icon name="th-large" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t.tabSettings,
          tabBarIcon: ({ color }) => <Icon name="cog" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <TabNavigator />
    </NavigationContainer>
  );
}

function App(): React.JSX.Element {
  const handleError = (error: Error) => {
    console.error('[GiwaProvider Error]', error);
  };

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <GiwaProvider config={{ network: 'testnet' }} onError={handleError}>
          <AppContent />
        </GiwaProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  envBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 12,
  },
  envText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  langTextActive: {
    color: '#007AFF',
  },
  langDivider: {
    fontSize: 12,
    color: '#ccc',
    marginHorizontal: 4,
  },
});

export default App;

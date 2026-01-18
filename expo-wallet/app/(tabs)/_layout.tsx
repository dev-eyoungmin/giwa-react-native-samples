import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';
import { useClientOnlyValue } from '../../components/useClientOnlyValue';
import { useLanguage, Language } from '../../lib/i18n';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

function EnvironmentBadge() {
  return (
    <View style={styles.envBadge}>
      <Text style={styles.envText}>Expo</Text>
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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarLabelStyle: { fontSize: 12 },
        headerLeft: () => <EnvironmentBadge />,
        headerRight: () => <LanguageToggle />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabHome,
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tokens"
        options={{
          title: t.tabAssets,
          tabBarIcon: ({ color }) => <TabBarIcon name="circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="transfer"
        options={{
          title: t.tabTransfer,
          tabBarIcon: ({ color }) => <TabBarIcon name="send" color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: t.tabServices,
          tabBarIcon: ({ color }) => <TabBarIcon name="th-large" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.tabSettings,
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />
      {/* Hide old tabs */}
      <Tabs.Screen name="balance" options={{ href: null }} />
      <Tabs.Screen name="send" options={{ href: null }} />
      <Tabs.Screen name="bridge" options={{ href: null }} />
      <Tabs.Screen name="flashblocks" options={{ href: null }} />
      <Tabs.Screen name="giwa-id" options={{ href: null }} />
      <Tabs.Screen name="faucet" options={{ href: null }} />
      <Tabs.Screen name="dojang" options={{ href: null }} />
      <Tabs.Screen name="test" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  envBadge: {
    backgroundColor: '#000',
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

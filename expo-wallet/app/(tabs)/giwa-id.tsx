import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useGiwaId, useGiwaWallet, useNetworkInfo } from 'giwa-react-native-wallet';

export default function GiwaIdScreen() {
  const { wallet, hasWallet } = useGiwaWallet();
  const { isFeatureAvailable } = useNetworkInfo();
  const {
    resolveAddress,
    resolveName,
    isAvailable,
    isLoading,
    error,
  } = useGiwaId();

  const [giwaId, setGiwaId] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [myName, setMyName] = useState<string | null>(null);
  const [isLoadingMyName, setIsLoadingMyName] = useState(false);

  const giwaIdAvailable = isFeatureAvailable('giwaId');

  if (!hasWallet) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Please create a wallet first</Text>
        <Text style={styles.subText}>Go to the Wallet tab to get started</Text>
      </View>
    );
  }

  if (!giwaIdAvailable) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>GIWA ID Not Available</Text>
        <Text style={styles.subText}>
          This feature is not available on the current network yet.
        </Text>
      </View>
    );
  }

  const handleResolveGiwaId = async () => {
    if (!giwaId) {
      Alert.alert('Error', 'Please enter a GIWA ID');
      return;
    }

    try {
      setResult(null);
      const address = await resolveAddress(giwaId);
      if (address) {
        setResult(`${giwaId} => ${address}`);
      } else {
        setResult(`"${giwaId}" not found`);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleResolveAddress = async () => {
    const addr = addressInput || wallet?.address;
    if (!addr) return;

    try {
      setResult(null);
      const name = await resolveName(addr as `0x${string}`);
      if (name) {
        setResult(`${addr.slice(0, 10)}...${addr.slice(-8)} => ${name}`);
      } else {
        setResult(`No GIWA ID found for this address`);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleCheckAvailability = async () => {
    if (!giwaId) {
      Alert.alert('Error', 'Please enter a GIWA ID');
      return;
    }

    try {
      setResult(null);
      const available = await isAvailable(giwaId);
      setResult(`"${giwaId}" is ${available ? 'AVAILABLE' : 'TAKEN'}`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleLookupMyName = async () => {
    if (!wallet) return;

    setIsLoadingMyName(true);
    try {
      const name = await resolveName(wallet.address);
      setMyName(name || 'No GIWA ID registered');
    } catch (err: any) {
      setMyName('Error looking up name');
    } finally {
      setIsLoadingMyName(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>GIWA ID</Text>
      <Text style={styles.subtitle}>
        ENS-based naming for GIWA Chain addresses
      </Text>

      {/* My GIWA ID */}
      <View style={styles.myIdCard}>
        <View style={styles.myIdHeader}>
          <Text style={styles.myIdLabel}>Your GIWA ID</Text>
          <TouchableOpacity onPress={handleLookupMyName} disabled={isLoadingMyName}>
            <Text style={styles.refreshText}>
              {isLoadingMyName ? 'Loading...' : 'Lookup'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.myIdValue}>{myName || 'Tap Lookup to check'}</Text>
        <Text style={styles.myAddress} selectable>
          {wallet?.address}
        </Text>
      </View>

      {/* Resolve GIWA ID to Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resolve GIWA ID</Text>
        <Text style={styles.sectionDescription}>
          Find the address associated with a GIWA ID
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., alice.giwa"
          value={giwaId}
          onChangeText={setGiwaId}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.disabledButton]}
            onPress={handleResolveGiwaId}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Resolve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, isLoading && styles.disabledButton]}
            onPress={handleCheckAvailability}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Check Availability</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Resolve Address to GIWA ID */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reverse Lookup</Text>
        <Text style={styles.sectionDescription}>
          Find the GIWA ID for an address
        </Text>
        <TextInput
          style={styles.input}
          placeholder="0x... (leave empty for your address)"
          value={addressInput}
          onChangeText={setAddressInput}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.button, isLoading && styles.disabledButton]}
          onPress={handleResolveAddress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Lookup</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Result */}
      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Result</Text>
          <Text style={styles.resultText} selectable>
            {result}
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error.message}</Text>
        </View>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>About GIWA ID</Text>
        <Text style={styles.infoText}>
          GIWA ID is an ENS-based naming system for GIWA Chain. It allows you to
          use human-readable names like "alice.giwa" instead of long addresses.
          {'\n\n'}
          Features:{'\n'}
          - Resolve names to addresses{'\n'}
          - Reverse lookup addresses to names{'\n'}
          - Check name availability
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  myIdCard: {
    backgroundColor: '#e8f5e9',
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
  },
  myIdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  myIdLabel: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
  },
  refreshText: {
    color: '#1b5e20',
    fontWeight: '600',
  },
  myIdValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 10,
  },
  myAddress: {
    fontSize: 11,
    fontFamily: 'SpaceMono',
    color: '#388e3c',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  resultCard: {
    backgroundColor: '#f3e5f5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7b1fa2',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#9c27b0',
    fontFamily: 'SpaceMono',
  },
  errorContainer: {
    padding: 15,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#c62828',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1976d2',
    lineHeight: 22,
  },
});

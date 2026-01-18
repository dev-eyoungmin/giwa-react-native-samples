import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useFaucet, useGiwaWallet, useBalance, useNetworkInfo } from 'giwa-react-native-wallet';
import * as Clipboard from 'expo-clipboard';

export default function FaucetScreen() {
  const { wallet, hasWallet } = useGiwaWallet();
  const { formattedBalance, refetch } = useBalance();
  const { isTestnet, network } = useNetworkInfo();
  const { requestFaucet, getFaucetUrl, isLoading, error } = useFaucet();

  if (!hasWallet) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Please create a wallet first</Text>
        <Text style={styles.subText}>Go to the Wallet tab to get started</Text>
      </View>
    );
  }

  if (!isTestnet) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Faucet Not Available</Text>
        <Text style={styles.subText}>
          The faucet is only available on testnet.
        </Text>
        <Text style={[styles.subText, { marginTop: 10 }]}>
          Current network: {network}
        </Text>
      </View>
    );
  }

  const handleRequestFaucet = async () => {
    try {
      await requestFaucet();
      const url = `${getFaucetUrl()}?address=${wallet?.address}`;
      await Linking.openURL(url);

      Alert.alert(
        'Faucet',
        'Faucet page opened in your browser. After receiving tokens, tap "Refresh Balance" to see your updated balance.',
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleOpenFaucetWebsite = async () => {
    const url = getFaucetUrl();
    await Linking.openURL(url);
  };

  const handleCopyAddress = async () => {
    if (wallet?.address) {
      await Clipboard.setStringAsync(wallet.address);
      Alert.alert('Copied', 'Address copied to clipboard');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Testnet Faucet</Text>
      <Text style={styles.subtitle}>Get free testnet ETH for testing</Text>

      {/* Wallet Info */}
      <View style={styles.walletCard}>
        <Text style={styles.walletLabel}>Your Wallet</Text>
        <Text style={styles.address} selectable>
          {wallet?.address}
        </Text>
        <TouchableOpacity style={styles.copyButton} onPress={handleCopyAddress}>
          <Text style={styles.copyButtonText}>Copy Address</Text>
        </TouchableOpacity>
      </View>

      {/* Balance */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceValue}>{formattedBalance ?? '0'} ETH</Text>
      </View>

      {/* Request Button */}
      <TouchableOpacity
        style={[styles.requestButton, isLoading && styles.disabledButton]}
        onPress={handleRequestFaucet}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.requestButtonText}>Request Testnet ETH</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleOpenFaucetWebsite}
      >
        <Text style={styles.secondaryButtonText}>Open Faucet Website</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.refreshButton} onPress={refetch}>
        <Text style={styles.refreshButtonText}>Refresh Balance</Text>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error.message}</Text>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>How to use the faucet</Text>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>1</Text>
          <Text style={styles.stepText}>Tap "Request Testnet ETH" to open the faucet</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>2</Text>
          <Text style={styles.stepText}>Complete any verification if required</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>3</Text>
          <Text style={styles.stepText}>Wait for the transaction to be confirmed</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>4</Text>
          <Text style={styles.stepText}>Tap "Refresh Balance" to see your ETH</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>About Testnet ETH</Text>
        <Text style={styles.infoText}>
          Testnet ETH has no real value and is used for testing purposes only.
          You can use it to test transactions, smart contracts, and other
          features on the GIWA testnet.
        </Text>
      </View>
    </View>
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
  walletCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  walletLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  address: {
    fontSize: 12,
    fontFamily: 'SpaceMono',
    color: '#333',
    marginBottom: 10,
  },
  copyButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: '#e8f5e9',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#2e7d32',
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  requestButton: {
    backgroundColor: '#2196F3',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  instructionsCard: {
    backgroundColor: '#fff3e0',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff9800',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 10,
    fontWeight: 'bold',
    fontSize: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: '#f57c00',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 12,
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
    lineHeight: 20,
  },
});

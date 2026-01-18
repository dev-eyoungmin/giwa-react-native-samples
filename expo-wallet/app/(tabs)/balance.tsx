import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useBalance, useGiwaWallet } from 'giwa-react-native-wallet';

export default function BalanceScreen() {
  const { wallet, hasWallet } = useGiwaWallet();
  const { balance, formattedBalance, isLoading, error, refetch } = useBalance();

  if (!hasWallet) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Please create a wallet first</Text>
        <Text style={styles.subText}>Go to the Wallet tab to get started</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ETH Balance</Text>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Fetching balance...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error.message}</Text>
        </View>
      )}

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceValue}>
          {formattedBalance ?? '0'} <Text style={styles.unit}>ETH</Text>
        </Text>
        {balance !== undefined && (
          <Text style={styles.rawBalance}>
            {balance.toString()} wei
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.refreshButton, isLoading && styles.disabledButton]}
        onPress={refetch}
        disabled={isLoading}
      >
        <Text style={styles.refreshButtonText}>
          {isLoading ? 'Refreshing...' : 'Refresh Balance'}
        </Text>
      </TouchableOpacity>

      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>Wallet Address</Text>
        <Text style={styles.address} selectable>
          {wallet?.address}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>About ETH Balance</Text>
        <Text style={styles.infoText}>
          This shows your ETH balance on the GIWA Chain (L2). Use the Faucet tab
          to get testnet ETH for testing.
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
  },
  subText: {
    fontSize: 14,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
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
  balanceCard: {
    backgroundColor: '#f5f5f5',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  unit: {
    fontSize: 24,
    fontWeight: 'normal',
    color: '#666',
  },
  rawBalance: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    fontFamily: 'SpaceMono',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addressContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  address: {
    fontSize: 12,
    fontFamily: 'SpaceMono',
    color: '#333',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 13,
    color: '#1976d2',
    lineHeight: 20,
  },
});

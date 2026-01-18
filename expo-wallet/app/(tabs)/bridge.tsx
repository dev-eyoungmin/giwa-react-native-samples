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
import { useBridge, useGiwaWallet, useNetworkInfo, useBalance } from 'giwa-react-native-wallet';

export default function BridgeScreen() {
  const { hasWallet, wallet } = useGiwaWallet();
  const { formattedBalance } = useBalance();
  const { isFeatureAvailable } = useNetworkInfo();
  const {
    withdrawETH,
    getPendingTransactions,
    getEstimatedWithdrawalTime,
    isLoading,
    error,
  } = useBridge();

  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [txStatus, setTxStatus] = useState<string | null>(null);

  const bridgeAvailable = isFeatureAvailable('bridge');

  if (!hasWallet) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Please create a wallet first</Text>
        <Text style={styles.subText}>Go to the Wallet tab to get started</Text>
      </View>
    );
  }

  if (!bridgeAvailable) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Bridge Not Available</Text>
        <Text style={styles.subText}>
          This feature is not available on the current network yet.
        </Text>
        <Text style={[styles.subText, { marginTop: 10 }]}>
          Bridge will be available when mainnet launches.
        </Text>
      </View>
    );
  }

  const handleWithdraw = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Invalid amount');
      return;
    }

    try {
      setTxStatus('Initiating withdrawal...');
      const hash = await withdrawETH(
        amount,
        recipient ? (recipient as `0x${string}`) : undefined
      );
      setTxStatus(`Withdrawal initiated!\nTransaction: ${hash.slice(0, 20)}...`);
      Alert.alert('Success', 'Withdrawal initiated successfully');
      setAmount('');
      setRecipient('');
    } catch (err: any) {
      setTxStatus(null);
      Alert.alert('Error', err.message);
    }
  };

  const pendingTxs = getPendingTransactions?.() || [];
  const estimatedTime = getEstimatedWithdrawalTime?.() || 0;
  const estimatedMinutes = Math.round(estimatedTime / 60000);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>L2 to L1 Bridge</Text>
      <Text style={styles.subtitle}>
        Withdraw ETH from GIWA Chain (L2) to Ethereum (L1)
      </Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Estimated Time</Text>
        <Text style={styles.infoValue}>~{estimatedMinutes || 7} minutes</Text>
        <Text style={styles.infoDescription}>
          Withdrawals require a challenge period for security.
        </Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>L2 Balance</Text>
        <Text style={styles.balanceValue}>{formattedBalance ?? '0'} ETH</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Amount (ETH)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.0"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Recipient on L1 (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder={wallet?.address || '0x...'}
          value={recipient}
          onChangeText={setRecipient}
          autoCapitalize="none"
        />
        <Text style={styles.hint}>Leave empty to use your current address</Text>
      </View>

      <TouchableOpacity
        style={[styles.withdrawButton, isLoading && styles.disabledButton]}
        onPress={handleWithdraw}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.withdrawButtonText}>Withdraw to L1</Text>
        )}
      </TouchableOpacity>

      {txStatus && (
        <View style={styles.statusCard}>
          <Text style={styles.statusText}>{txStatus}</Text>
        </View>
      )}

      {/* Pending Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Withdrawals</Text>
        {pendingTxs.length === 0 ? (
          <Text style={styles.emptyText}>No pending withdrawals</Text>
        ) : (
          pendingTxs.map((tx: any, index: number) => (
            <View key={tx.hash || index} style={styles.txCard}>
              <Text style={styles.txHash}>{tx.hash?.slice(0, 20)}...</Text>
              <Text style={styles.txStatus}>Status: {tx.status}</Text>
            </View>
          ))
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error.message}</Text>
        </View>
      )}

      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>Important</Text>
        <Text style={styles.warningText}>
          - Withdrawals are not instant and require waiting{'\n'}
          - Once initiated, withdrawals cannot be cancelled{'\n'}
          - Make sure the recipient address is correct
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
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 12,
    color: '#1565c0',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d47a1',
  },
  infoDescription: {
    fontSize: 12,
    color: '#1976d2',
    marginTop: 5,
  },
  balanceCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  withdrawButton: {
    backgroundColor: '#ff6f00',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  withdrawButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusCard: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusText: {
    color: '#2e7d32',
    lineHeight: 22,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  txCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  txHash: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#333',
  },
  txStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
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
  warningCard: {
    backgroundColor: '#fff3e0',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#f57c00',
    lineHeight: 22,
  },
});

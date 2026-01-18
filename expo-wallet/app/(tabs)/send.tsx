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
import { useTransaction, useGiwaWallet, useBalance } from 'giwa-react-native-wallet';

export default function SendScreen() {
  const { hasWallet } = useGiwaWallet();
  const { formattedBalance, refetch: refetchBalance } = useBalance();
  const { sendTransaction, waitForReceipt, isLoading, error } = useTransaction();

  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  if (!hasWallet) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Please create a wallet first</Text>
        <Text style={styles.subText}>Go to the Wallet tab to get started</Text>
      </View>
    );
  }

  const handleSend = async () => {
    if (!to || !amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!to.startsWith('0x') || to.length !== 42) {
      Alert.alert('Error', 'Invalid address format');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Invalid amount');
      return;
    }

    try {
      setTxStatus('Sending transaction...');
      setTxHash(null);

      const hash = await sendTransaction({
        to: to as `0x${string}`,
        value: amount,
      });

      setTxHash(hash);
      setTxStatus('Transaction sent! Waiting for confirmation...');

      const receipt = await waitForReceipt(hash);

      setTxStatus(
        `Confirmed in block ${receipt.blockNumber}\nStatus: ${
          receipt.status === 'success' ? 'Success' : 'Failed'
        }\nGas used: ${receipt.gasUsed.toString()}`
      );

      // Refresh balance after successful transaction
      refetchBalance();

      setTo('');
      setAmount('');
    } catch (err: any) {
      setTxStatus(null);
      setTxHash(null);
      Alert.alert('Error', err.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Send ETH</Text>

      <View style={styles.balanceInfo}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceValue}>{formattedBalance ?? '0'} ETH</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Recipient Address</Text>
        <TextInput
          style={styles.input}
          placeholder="0x..."
          value={to}
          onChangeText={setTo}
          autoCapitalize="none"
          autoCorrect={false}
        />
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

      <TouchableOpacity
        style={[styles.sendButton, isLoading && styles.disabledButton]}
        onPress={handleSend}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.sendButtonText}>Send ETH</Text>
        )}
      </TouchableOpacity>

      {txStatus && (
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Transaction Status</Text>
          <Text style={styles.statusText}>{txStatus}</Text>
          {txHash && (
            <View style={styles.hashContainer}>
              <Text style={styles.hashLabel}>Transaction Hash:</Text>
              <Text style={styles.hash} selectable>
                {txHash}
              </Text>
            </View>
          )}
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error.message}</Text>
        </View>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Transaction Tips</Text>
        <Text style={styles.infoText}>
          - Transactions are sent on GIWA Chain (L2){'\n'}
          - Gas fees are paid in ETH{'\n'}
          - Confirmation usually takes a few seconds
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
  balanceInfo: {
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
    fontSize: 24,
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
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
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
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#388e3c',
    lineHeight: 22,
  },
  hashContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#c8e6c9',
  },
  hashLabel: {
    fontSize: 12,
    color: '#2e7d32',
    marginBottom: 5,
  },
  hash: {
    fontSize: 11,
    fontFamily: 'SpaceMono',
    color: '#1b5e20',
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
    backgroundColor: '#fff3e0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#f57c00',
    lineHeight: 22,
  },
});

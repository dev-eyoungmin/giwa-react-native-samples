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
  Switch,
} from 'react-native';
import { useFlashblocks, useGiwaWallet, useBalance, parseEther } from 'giwa-react-native-wallet';

export default function FlashblocksScreen() {
  const { hasWallet } = useGiwaWallet();
  const { formattedBalance, refetch: refetchBalance } = useBalance();
  const {
    isEnabled,
    setEnabled,
    sendTransaction,
    getAverageLatency,
    getAllPreconfirmations,
    isLoading,
    error,
  } = useFlashblocks();

  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [txResult, setTxResult] = useState<string | null>(null);

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

    try {
      setTxResult('Sending with Flashblocks...');

      const startTime = Date.now();
      const { preconfirmation, result } = await sendTransaction({
        to: to as `0x${string}`,
        value: parseEther(amount),
      });

      const preconfTime = Date.now() - startTime;
      setTxResult(
        `Preconfirmed in ${preconfTime}ms!\n` +
          `Hash: ${preconfirmation.txHash.slice(0, 20)}...`
      );

      const receipt = await result.wait();
      const totalTime = Date.now() - startTime;
      setTxResult(
        (prev) =>
          `${prev}\n\n` +
          `Final confirmation:\n` +
          `Block: ${receipt.blockNumber}\n` +
          `Total time: ${totalTime}ms`
      );

      refetchBalance();
      setTo('');
      setAmount('');
    } catch (err: any) {
      setTxResult(null);
      Alert.alert('Error', err.message);
    }
  };

  const avgLatency = getAverageLatency?.() || null;
  const preconfs = getAllPreconfirmations?.() || [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Flashblocks</Text>
      <Text style={styles.subtitle}>
        ~200ms preconfirmation for instant transactions
      </Text>

      {/* Flashblocks Toggle */}
      <View style={styles.toggleCard}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleLabel}>Flashblocks</Text>
          <Text style={styles.toggleDescription}>
            {isEnabled ? 'Fast transactions enabled' : 'Enable for faster transactions'}
          </Text>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={setEnabled}
          trackColor={{ false: '#ddd', true: '#4CAF50' }}
          thumbColor={isEnabled ? '#fff' : '#f4f3f4'}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Avg Latency</Text>
          <Text style={styles.statValue}>
            {avgLatency ? `${avgLatency.toFixed(0)}ms` : '--'}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Preconfirmations</Text>
          <Text style={styles.statValue}>{preconfs.length}</Text>
        </View>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceValue}>{formattedBalance ?? '0'} ETH</Text>
      </View>

      {/* Send Form */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Recipient Address</Text>
        <TextInput
          style={styles.input}
          placeholder="0x..."
          value={to}
          onChangeText={setTo}
          autoCapitalize="none"
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
        style={[
          styles.sendButton,
          (!isEnabled || isLoading) && styles.disabledButton,
        ]}
        onPress={handleSend}
        disabled={!isEnabled || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.sendButtonText}>
            {isEnabled ? 'Send with Flashblocks' : 'Enable Flashblocks First'}
          </Text>
        )}
      </TouchableOpacity>

      {txResult && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Transaction Result</Text>
          <Text style={styles.resultText}>{txResult}</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error.message}</Text>
        </View>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How Flashblocks Works</Text>
        <Text style={styles.infoText}>
          1. Your transaction is sent to the Flashblocks RPC{'\n'}
          2. You receive a preconfirmation in ~200ms{'\n'}
          3. The transaction is included in the next block{'\n'}
          4. Final confirmation comes shortly after
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Recent Preconfirmations ({preconfs.length})
        </Text>
        {preconfs.length === 0 ? (
          <Text style={styles.emptyText}>No preconfirmations yet</Text>
        ) : (
          preconfs.slice(0, 5).map((pc: any, i: number) => (
            <View key={i} style={styles.preconfCard}>
              <Text style={styles.preconfHash}>
                {pc.txHash?.slice(0, 30)}...
              </Text>
              <Text style={styles.preconfTime}>
                Preconfirmed at: {new Date(pc.preconfirmedAt).toLocaleTimeString()}
              </Text>
            </View>
          ))
        )}
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  toggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  toggleDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#2e7d32',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b5e20',
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
  sendButton: {
    backgroundColor: '#7c4dff',
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
  resultCard: {
    backgroundColor: '#ede7f6',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4527a0',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#5e35b1',
    lineHeight: 22,
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
    marginBottom: 20,
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  preconfCard: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  preconfHash: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: '#333',
  },
  preconfTime: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
});

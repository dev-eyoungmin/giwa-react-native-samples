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
import { useTransaction, useGiwaWallet, useBalance, useBridge, useNetworkInfo } from 'giwa-react-native-wallet';
import { useLanguage } from '../lib/i18n';

type TabType = 'send' | 'bridge';

export default function TransferScreen() {
  const { hasWallet, wallet } = useGiwaWallet();
  const { formattedBalance, refetch: refetchBalance } = useBalance();
  const { sendTransaction, waitForReceipt, isLoading: sendLoading, error: sendError } = useTransaction();
  const { withdrawETH, isLoading: bridgeLoading, error: bridgeError } = useBridge();
  const { isFeatureAvailable } = useNetworkInfo();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabType>('send');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const bridgeAvailable = isFeatureAvailable('bridge');

  if (!hasWallet) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>{language === 'ko' ? '먼저 지갑을 생성해주세요' : 'Please create a wallet first'}</Text>
        <Text style={styles.subText}>{language === 'ko' ? '홈 탭에서 지갑을 생성할 수 있습니다' : 'You can create a wallet in the Home tab'}</Text>
      </View>
    );
  }

  const handleSend = async () => {
    if (!to || !amount) {
      Alert.alert(t.error, t.fillAllFields);
      return;
    }

    if (!to.startsWith('0x') || to.length !== 42) {
      Alert.alert(t.error, t.invalidAddressFormat);
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert(t.error, t.invalidAmount);
      return;
    }

    try {
      setTxStatus(t.sendingTransaction);
      setTxHash(null);

      const hash = await sendTransaction({
        to: to as `0x${string}`,
        value: amount,
      });

      setTxHash(hash);
      setTxStatus(t.transactionSentWaiting);

      const receipt = await waitForReceipt(hash);

      setTxStatus(
        `${t.confirmedInBlock} ${receipt.blockNumber}\n${t.status}: ${
          receipt.status === 'success' ? t.statusSuccess : t.statusFailed
        }\n${t.gasUsed}: ${receipt.gasUsed.toString()}`
      );

      refetchBalance();
      setTo('');
      setAmount('');
    } catch (err: any) {
      setTxStatus(null);
      setTxHash(null);
      Alert.alert(t.error, err.message);
    }
  };

  const handleBridge = async () => {
    if (!amount) {
      Alert.alert(t.error, t.fillAllFields);
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert(t.error, t.invalidAmount);
      return;
    }

    try {
      setTxStatus(t.withdrawalStarted);
      const hash = await withdrawETH(
        amount,
        to ? (to as `0x${string}`) : undefined
      );
      setTxStatus(`${t.withdrawalInitiated}\n${t.hash}: ${hash.slice(0, 20)}...`);
      Alert.alert(t.success, t.withdrawalInitiated);
      setAmount('');
      setTo('');
    } catch (err: any) {
      setTxStatus(null);
      Alert.alert(t.error, err.message);
    }
  };

  const isLoading = sendLoading || bridgeLoading;
  const error = sendError || bridgeError;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t.transferTitle}</Text>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'send' && styles.activeTab]}
          onPress={() => {
            setActiveTab('send');
            setTxStatus(null);
            setTxHash(null);
          }}
        >
          <Text style={[styles.tabText, activeTab === 'send' && styles.activeTabText]}>
            {t.sendEth}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bridge' && styles.activeTab, !bridgeAvailable && styles.disabledTab]}
          onPress={() => {
            if (bridgeAvailable) {
              setActiveTab('bridge');
              setTxStatus(null);
              setTxHash(null);
            }
          }}
          disabled={!bridgeAvailable}
        >
          <Text style={[styles.tabText, activeTab === 'bridge' && styles.activeTabText, !bridgeAvailable && styles.disabledTabText]}>
            {t.l1Bridge} {!bridgeAvailable && `(${t.preparing})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Balance Display */}
      <View style={styles.balanceInfo}>
        <Text style={styles.balanceLabel}>
          {activeTab === 'send' ? t.availableBalance : t.l2Balance}
        </Text>
        <Text style={styles.balanceValue}>{formattedBalance ?? '0'} ETH</Text>
      </View>

      {activeTab === 'send' ? (
        <>
          {/* Send Form */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.recipientAddressLabel}</Text>
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
            <Text style={styles.label}>{t.amountEth}</Text>
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
              <Text style={styles.sendButtonText}>{t.sendEthButton}</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* Bridge Form */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{t.estimatedTime}</Text>
            <Text style={styles.infoValue}>{t.estimatedTimeValue}</Text>
            <Text style={styles.infoDescription}>
              {t.estimatedTimeDescription}
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.amountEth}</Text>
            <TextInput
              style={styles.input}
              placeholder="0.0"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.l1RecipientOptional}</Text>
            <TextInput
              style={styles.input}
              placeholder={wallet?.address || '0x...'}
              value={to}
              onChangeText={setTo}
              autoCapitalize="none"
            />
            <Text style={styles.hint}>{t.leaveEmptyForCurrentAddress}</Text>
          </View>

          <TouchableOpacity
            style={[styles.bridgeButton, isLoading && styles.disabledButton]}
            onPress={handleBridge}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>{t.withdrawToL1}</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {/* Transaction Status */}
      {txStatus && (
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>{t.transactionStatus}</Text>
          <Text style={styles.statusText}>{txStatus}</Text>
          {txHash && (
            <View style={styles.hashContainer}>
              <Text style={styles.hashLabel}>{t.transactionHash}:</Text>
              <Text style={styles.hash} selectable>
                {txHash}
              </Text>
            </View>
          )}
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t.error}: {error.message}</Text>
        </View>
      )}

      {/* Tip Card */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>
          {activeTab === 'send' ? t.sendTips : t.bridgeTips}
        </Text>
        <Text style={styles.tipText}>
          {activeTab === 'send'
            ? `- ${t.sendTip1}\n- ${t.sendTip2}\n- ${t.sendTip3}`
            : `- ${t.bridgeTip1}\n- ${t.bridgeTip2}\n- ${t.bridgeTip3}`}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  disabledTab: {
    opacity: 0.5,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  disabledTabText: {
    color: '#999',
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
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  bridgeButton: {
    backgroundColor: '#ff6f00',
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
    fontFamily: 'monospace',
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
  tipCard: {
    backgroundColor: '#fff3e0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#f57c00',
    lineHeight: 22,
  },
});

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
import { useTokens, useGiwaWallet } from 'giwa-react-native-wallet';
import { useLanguage } from '../lib/i18n';

interface TokenBalance {
  address: string;
  name: string;
  symbol: string;
  balance: string;
  decimals: number;
}

export default function TokensScreen() {
  const { hasWallet } = useGiwaWallet();
  const {
    getToken,
    getBalance,
    transfer,
    addCustomToken,
    removeCustomToken,
    error,
  } = useTokens();
  const { t, language } = useLanguage();

  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  if (!hasWallet) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>{language === 'ko' ? '먼저 지갑을 생성해주세요' : 'Please create a wallet first'}</Text>
        <Text style={styles.subText}>{language === 'ko' ? '홈 탭에서 지갑을 생성할 수 있습니다' : 'You can create a wallet in the Home tab'}</Text>
      </View>
    );
  }

  const handleAddToken = async () => {
    if (!tokenAddress || !tokenAddress.startsWith('0x')) {
      Alert.alert(t.error, language === 'ko' ? '올바른 토큰 주소를 입력해주세요' : 'Please enter a valid token address');
      return;
    }

    setIsAdding(true);
    try {
      const token = await getToken(tokenAddress as `0x${string}`);
      addCustomToken(token);

      const balance = await getBalance(tokenAddress as `0x${string}`);
      setTokenBalances((prev) => [
        ...prev,
        {
          address: tokenAddress,
          name: token.name,
          symbol: token.symbol,
          balance: balance.formattedBalance,
          decimals: token.decimals,
        },
      ]);

      setTokenAddress('');
      Alert.alert(t.success, `${token.symbol} ${t.tokenAdded}`);
    } catch (err: any) {
      Alert.alert(t.error, err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveToken = (address: string) => {
    Alert.alert(t.removeToken, t.removeTokenConfirm, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.remove,
        style: 'destructive',
        onPress: () => {
          removeCustomToken(address as `0x${string}`);
          setTokenBalances((prev) => prev.filter((tok) => tok.address !== address));
          if (selectedToken === address) {
            setSelectedToken(null);
          }
        },
      },
    ]);
  };

  const handleTransfer = async () => {
    if (!selectedToken || !transferTo || !transferAmount) {
      Alert.alert(t.error, t.fillAllFields);
      return;
    }

    setIsTransferring(true);
    try {
      const hash = await transfer(
        selectedToken as `0x${string}`,
        transferTo as `0x${string}`,
        transferAmount
      );
      Alert.alert(t.success, `${t.transactionSent}\n${t.hash}: ${hash.slice(0, 20)}...`);
      setTransferTo('');
      setTransferAmount('');

      // Refresh balance
      const balance = await getBalance(selectedToken as `0x${string}`);
      setTokenBalances((prev) =>
        prev.map((tok) =>
          tok.address === selectedToken
            ? { ...tok, balance: balance.formattedBalance }
            : tok
        )
      );
    } catch (err: any) {
      Alert.alert(t.error, err.message);
    } finally {
      setIsTransferring(false);
    }
  };

  const selectedTokenInfo = tokenBalances.find((token) => token.address === selectedToken);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t.assetsTitle}</Text>

      {/* Add Token Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.addToken}</Text>
        <TextInput
          style={styles.input}
          placeholder={t.tokenContractAddress}
          value={tokenAddress}
          onChangeText={setTokenAddress}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.button, isAdding && styles.disabledButton]}
          onPress={handleAddToken}
          disabled={isAdding}
        >
          {isAdding ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>{t.addToken}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Token List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.myTokens}</Text>
        {tokenBalances.length === 0 ? (
          <Text style={styles.emptyText}>{t.noTokensYet}</Text>
        ) : (
          tokenBalances.map((token) => (
            <TouchableOpacity
              key={token.address}
              style={[
                styles.tokenCard,
                selectedToken === token.address && styles.selectedToken,
              ]}
              onPress={() => setSelectedToken(token.address)}
              onLongPress={() => handleRemoveToken(token.address)}
            >
              <View style={styles.tokenInfo}>
                <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                <Text style={styles.tokenName}>{token.name}</Text>
              </View>
              <Text style={styles.tokenBalance}>{token.balance}</Text>
            </TouchableOpacity>
          ))
        )}
        {tokenBalances.length > 0 && (
          <Text style={styles.hintText}>
            {t.tapToSelectLongPressRemove}
          </Text>
        )}
      </View>

      {/* Transfer Section */}
      {selectedToken && selectedTokenInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedTokenInfo.symbol} {t.transfer}
          </Text>
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedBalance}>
              {t.tokenBalance}: {selectedTokenInfo.balance} {selectedTokenInfo.symbol}
            </Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder={t.recipientAddress}
            value={transferTo}
            onChangeText={setTransferTo}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder={t.amount}
            value={transferAmount}
            onChangeText={setTransferAmount}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity
            style={[styles.primaryButton, isTransferring && styles.disabledButton]}
            onPress={handleTransfer}
            disabled={isTransferring}
          >
            {isTransferring ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>{t.transfer}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t.error}: {error.message}</Text>
        </View>
      )}
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
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
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
  button: {
    backgroundColor: '#666',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  tokenCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedToken: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  tokenInfo: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tokenName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  tokenBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  hintText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  selectedInfo: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedBalance: {
    color: '#1565c0',
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
});

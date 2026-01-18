import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'ko' | 'en';

interface TranslationStrings {
  // Common
  error: string;
  success: string;
  cancel: string;
  confirm: string;
  copy: string;
  copied: string;
  copiedToClipboard: string;
  loading: string;
  refresh: string;
  delete: string;
  save: string;
  done: string;
  yes: string;
  no: string;

  // Tabs
  tabHome: string;
  tabAssets: string;
  tabTransfer: string;
  tabServices: string;
  tabSettings: string;

  // Home Screen
  homeTitle: string;
  homeSubtitle: string;
  balance: string;
  balanceRefresh: string;
  walletAddress: string;
  copyAddress: string;
  walletManagement: string;
  exportMnemonic: string;
  exportPrivateKey: string;
  deleteWallet: string;
  walletSecurity: string;
  securityTip1: string;
  securityTip2: string;
  securityTip3: string;
  createNewWallet: string;
  recoverWithMnemonic: string;
  importPrivateKey: string;
  saveRecoveryPhrase: string;
  recoveryPhraseWarning: string;
  iSavedIt: string;
  recoverWallet: string;
  importWalletTitle: string;
  enterMnemonic: string;
  enterPrivateKey: string;
  recover: string;
  import: string;
  exportedCredentials: string;
  neverShareWarning: string;
  securityWarning: string;
  securityWarningMessage: string;
  continue: string;
  deleteWalletConfirm: string;
  deleteWalletMessage: string;
  walletDeleted: string;
  walletRecovered: string;
  walletImported: string;
  noMnemonic: string;
  sdkInitializing: string;
  testnet: string;
  mainnet: string;

  // Assets Screen
  assetsTitle: string;
  addToken: string;
  tokenContractAddress: string;
  myTokens: string;
  noTokensYet: string;
  tapToSelectLongPressRemove: string;
  transfer: string;
  tokenBalance: string;
  recipientAddress: string;
  amount: string;
  removeToken: string;
  removeTokenConfirm: string;
  remove: string;
  tokenAdded: string;
  transactionSent: string;

  // Transfer Screen
  transferTitle: string;
  sendEth: string;
  l1Bridge: string;
  preparing: string;
  availableBalance: string;
  l2Balance: string;
  recipientAddressLabel: string;
  amountEth: string;
  sendEthButton: string;
  estimatedTime: string;
  estimatedTimeValue: string;
  estimatedTimeDescription: string;
  l1RecipientOptional: string;
  leaveEmptyForCurrentAddress: string;
  withdrawToL1: string;
  transactionStatus: string;
  transactionHash: string;
  sendingTransaction: string;
  transactionSentWaiting: string;
  confirmedInBlock: string;
  statusSuccess: string;
  statusFailed: string;
  gasUsed: string;
  withdrawalStarted: string;
  withdrawalInitiated: string;
  sendTips: string;
  sendTip1: string;
  sendTip2: string;
  sendTip3: string;
  bridgeTips: string;
  bridgeTip1: string;
  bridgeTip2: string;
  bridgeTip3: string;
  invalidAddressFormat: string;
  invalidAmount: string;
  fillAllFields: string;

  // Services Screen
  servicesTitle: string;
  faucet: string;
  flashblocks: string;
  giwaId: string;
  dojang: string;
  faucetNotAvailable: string;
  faucetTestnetOnly: string;
  currentBalance: string;
  myAddress: string;
  requestTestnetEth: string;
  refreshBalance: string;
  aboutTestnetEth: string;
  testnetEthDescription: string;
  faucetOpened: string;
  faucetOpenedMessage: string;
  flashblocksToggle: string;
  fastTransactionsEnabled: string;
  enableForFastTransactions: string;
  avgLatency: string;
  sendWithFlashblocks: string;
  enableFlashblocksFirst: string;
  preconfirmedIn: string;
  hash: string;
  flashblocksHowItWorks: string;
  flashblocksStep1: string;
  flashblocksStep2: string;
  flashblocksStep3: string;
  giwaIdLookup: string;
  exampleGiwaId: string;
  lookupAddress: string;
  checkAvailability: string;
  available: string;
  taken: string;
  notFound: string;
  aboutGiwaId: string;
  giwaIdDescription: string;
  attestationUid: string;
  checkAttestationValidity: string;
  checkMyVerificationStatus: string;
  attestationValid: string;
  attestationInvalid: string;
  myAddressVerified: string;
  myAddressNotVerified: string;
  aboutDojang: string;
  dojangDescription: string;
  result: string;
  networkNotAvailable: string;

  // Settings Screen
  settingsTitle: string;
  networkInfo: string;
  sdkTest: string;
  networkStatus: string;
  network: string;
  name: string;
  chainId: string;
  type: string;
  status: string;
  ready: string;
  notReady: string;
  networkWarnings: string;
  featureAvailability: string;
  bridge: string;
  rpcEndpoints: string;
  show: string;
  hide: string;
  rpcUrl: string;
  blockExplorer: string;
  tapToCopyTapExplorerToOpen: string;
  walletStatus: string;
  connected: string;
  address: string;
  sdkInfo: string;
  sdkInfoText: string;
  runAllTests: string;
  running: string;
  results: string;
  pass: string;
  fail: string;
  skip: string;
  testCoverage: string;
  testCoverageList: string;
  language: string;
  korean: string;
  english: string;

  // Test names
  testNetworkInfo: string;
  testWalletCreate: string;
  testExportMnemonic: string;
  testExportPrivateKey: string;
  testBalanceQuery: string;
  testBridgeAvailable: string;
  testFlashblocks: string;
  testGiwaIdAvailable: string;
  testDojangAvailable: string;
  testFaucetAvailable: string;
  testFeatureSummary: string;
  walletExists: string;
  noWallet: string;
  networkConfigUnavailable: string;
  exportFailed: string;
  toggleWorking: string;
  notAvailableOnNetwork: string;
  mainnetFaucetUnavailable: string;
  featuresAvailable: string;
  words: string;
}

const translations: Record<Language, TranslationStrings> = {
  ko: {
    // Common
    error: '오류',
    success: '성공',
    cancel: '취소',
    confirm: '확인',
    copy: '복사',
    copied: '복사됨',
    copiedToClipboard: '클립보드에 복사되었습니다',
    loading: '로딩 중...',
    refresh: '새로고침',
    delete: '삭제',
    save: '저장',
    done: '완료',
    yes: '예',
    no: '아니오',

    // Tabs
    tabHome: '홈',
    tabAssets: '자산',
    tabTransfer: '전송',
    tabServices: '서비스',
    tabSettings: '설정',

    // Home Screen
    homeTitle: 'GIWA 지갑',
    homeSubtitle: '시작하려면 지갑을 생성하거나 가져오세요',
    balance: '보유 잔액',
    balanceRefresh: '잔액 새로고침',
    walletAddress: '지갑 주소',
    copyAddress: '주소 복사',
    walletManagement: '지갑 관리',
    exportMnemonic: '복구 문구 내보내기',
    exportPrivateKey: '개인키 내보내기',
    deleteWallet: '지갑 삭제',
    walletSecurity: '지갑 보안',
    securityTip1: '개인키는 이 기기에 안전하게 저장됩니다',
    securityTip2: '항상 복구 문구를 백업하세요',
    securityTip3: '개인키나 복구 문구를 절대 공유하지 마세요',
    createNewWallet: '새 지갑 생성',
    recoverWithMnemonic: '복구 문구로 복구',
    importPrivateKey: '개인키로 가져오기',
    saveRecoveryPhrase: '복구 문구 저장',
    recoveryPhraseWarning: '이 12개의 단어를 순서대로 적어두세요. 절대 다른 사람과 공유하지 마세요!',
    iSavedIt: '저장했습니다',
    recoverWallet: '지갑 복구',
    importWalletTitle: '개인키로 가져오기',
    enterMnemonic: '12개의 복구 단어를 입력하세요',
    enterPrivateKey: '개인키를 입력하세요 (0x로 시작)',
    recover: '복구',
    import: '가져오기',
    exportedCredentials: '내보낸 정보',
    neverShareWarning: '이 정보를 절대 다른 사람과 공유하지 마세요!',
    securityWarning: '보안 경고',
    securityWarningMessage: '지갑 정보가 표시됩니다. 주변에 아무도 없는지 확인하세요.',
    continue: '계속',
    deleteWalletConfirm: '지갑 삭제',
    deleteWalletMessage: '정말 지갑을 삭제하시겠습니까? 복구 문구를 백업했는지 확인하세요.',
    walletDeleted: '지갑이 삭제되었습니다',
    walletRecovered: '지갑이 복구되었습니다',
    walletImported: '지갑을 가져왔습니다',
    noMnemonic: '니모닉이 없습니다 (개인키로 가져온 지갑)',
    sdkInitializing: 'SDK 초기화 중...',
    testnet: '테스트넷',
    mainnet: '메인넷',

    // Assets Screen
    assetsTitle: '토큰 관리',
    addToken: '토큰 추가',
    tokenContractAddress: '토큰 컨트랙트 주소 (0x...)',
    myTokens: '내 토큰',
    noTokensYet: '추가된 토큰이 없습니다',
    tapToSelectLongPressRemove: '탭하여 선택, 길게 눌러 제거',
    transfer: '전송',
    tokenBalance: '잔액',
    recipientAddress: '받는 주소 (0x...)',
    amount: '금액',
    removeToken: '토큰 제거',
    removeTokenConfirm: '이 토큰을 제거하시겠습니까?',
    remove: '제거',
    tokenAdded: '추가됨',
    transactionSent: '트랜잭션 전송됨!',

    // Transfer Screen
    transferTitle: '전송',
    sendEth: 'ETH 보내기',
    l1Bridge: 'L1 브릿지',
    preparing: '준비중',
    availableBalance: '보유 잔액',
    l2Balance: 'L2 잔액',
    recipientAddressLabel: '받는 주소',
    amountEth: '금액 (ETH)',
    sendEthButton: 'ETH 보내기',
    estimatedTime: '예상 시간',
    estimatedTimeValue: '~7분',
    estimatedTimeDescription: '출금은 보안을 위해 일정 시간이 소요됩니다.',
    l1RecipientOptional: 'L1 받는 주소 (선택사항)',
    leaveEmptyForCurrentAddress: '비워두면 현재 주소로 출금됩니다',
    withdrawToL1: 'L1으로 출금',
    transactionStatus: '트랜잭션 상태',
    transactionHash: '트랜잭션 해시',
    sendingTransaction: '트랜잭션 전송 중...',
    transactionSentWaiting: '트랜잭션 전송 완료! 확인 대기 중...',
    confirmedInBlock: '블록에서 확인됨',
    statusSuccess: '성공',
    statusFailed: '실패',
    gasUsed: '가스 사용량',
    withdrawalStarted: '출금 시작 중...',
    withdrawalInitiated: '출금이 시작되었습니다!',
    sendTips: '송금 안내',
    sendTip1: 'GIWA Chain (L2)에서 트랜잭션이 전송됩니다',
    sendTip2: '가스비는 ETH로 지불됩니다',
    sendTip3: '확인에 몇 초가 소요됩니다',
    bridgeTips: '브릿지 안내',
    bridgeTip1: '출금은 즉시 완료되지 않습니다',
    bridgeTip2: '한번 시작된 출금은 취소할 수 없습니다',
    bridgeTip3: '받는 주소를 정확히 확인하세요',
    invalidAddressFormat: '올바르지 않은 주소 형식입니다',
    invalidAmount: '올바르지 않은 금액입니다',
    fillAllFields: '모든 필드를 입력해주세요',

    // Services Screen
    servicesTitle: '서비스',
    faucet: 'Faucet',
    flashblocks: 'Flashblocks',
    giwaId: 'GIWA ID',
    dojang: 'Dojang',
    faucetNotAvailable: 'Faucet 사용 불가',
    faucetTestnetOnly: 'Faucet은 테스트넷에서만 사용할 수 있습니다.',
    currentBalance: '현재 잔액',
    myAddress: '내 주소',
    requestTestnetEth: '테스트넷 ETH 받기',
    refreshBalance: '잔액 새로고침',
    aboutTestnetEth: '테스트넷 ETH 안내',
    testnetEthDescription: '테스트넷 ETH는 실제 가치가 없으며 테스트 목적으로만 사용됩니다.',
    faucetOpened: 'Faucet',
    faucetOpenedMessage: '브라우저에서 Faucet 페이지가 열렸습니다. 토큰 수령 후 "잔액 새로고침"을 눌러주세요.',
    flashblocksToggle: 'Flashblocks',
    fastTransactionsEnabled: '빠른 트랜잭션 활성화됨',
    enableForFastTransactions: '빠른 트랜잭션을 위해 활성화하세요',
    avgLatency: '평균 지연',
    sendWithFlashblocks: 'Flashblocks로 전송',
    enableFlashblocksFirst: 'Flashblocks를 먼저 활성화하세요',
    preconfirmedIn: '에 사전 확인됨!',
    hash: '해시',
    flashblocksHowItWorks: 'Flashblocks 작동 방식',
    flashblocksStep1: '1. 트랜잭션이 Flashblocks RPC로 전송됩니다',
    flashblocksStep2: '2. ~200ms 내에 사전 확인을 받습니다',
    flashblocksStep3: '3. 다음 블록에 트랜잭션이 포함됩니다',
    giwaIdLookup: 'GIWA ID 조회',
    exampleGiwaId: '예: alice.giwa',
    lookupAddress: '주소 조회',
    checkAvailability: '사용 가능 확인',
    available: '사용 가능',
    taken: '이미 사용 중',
    notFound: '을 찾을 수 없습니다',
    aboutGiwaId: 'GIWA ID 소개',
    giwaIdDescription: 'GIWA ID는 ENS 기반 네이밍 시스템입니다. 긴 주소 대신 "alice.giwa"와 같은 읽기 쉬운 이름을 사용할 수 있습니다.',
    attestationUid: '증명 UID',
    checkAttestationValidity: '증명 유효성 확인',
    checkMyVerificationStatus: '내 주소 인증 상태 확인',
    attestationValid: '증명이 유효합니다',
    attestationInvalid: '증명이 유효하지 않습니다',
    myAddressVerified: '내 주소는 인증되었습니다',
    myAddressNotVerified: '내 주소는 인증되지 않았습니다',
    aboutDojang: 'Dojang 소개',
    dojangDescription: 'Dojang은 GIWA Chain의 EAS 기반 증명 시스템입니다.\n\n- 신원 인증\n- 잔액 증명\n- 온체인 평판 구축',
    result: '결과',
    networkNotAvailable: '이 네트워크에서 사용 불가',

    // Settings Screen
    settingsTitle: '설정',
    networkInfo: '네트워크 정보',
    sdkTest: 'SDK 테스트',
    networkStatus: '네트워크 상태',
    network: '네트워크',
    name: '이름',
    chainId: 'Chain ID',
    type: '유형',
    status: '상태',
    ready: '준비됨',
    notReady: '준비 안됨',
    networkWarnings: '네트워크 경고',
    featureAvailability: '기능 가용성',
    bridge: '브릿지 (L1↔L2)',
    rpcEndpoints: 'RPC 엔드포인트',
    show: '보기',
    hide: '숨기기',
    rpcUrl: 'RPC URL',
    blockExplorer: '블록 탐색기',
    tapToCopyTapExplorerToOpen: '탭하여 복사, 탐색기 탭하여 열기',
    walletStatus: '지갑 상태',
    connected: '연결됨',
    address: '주소',
    sdkInfo: 'SDK 정보',
    sdkInfoText: 'GIWA React Native Wallet SDK\n버전: 0.1.0\n\n지갑 관리, 트랜잭션, 브릿지 작업, Flashblocks, GIWA ID, Dojang 증명을 포함한 모든 SDK 기능을 검증하기 위한 테스트 앱입니다.',
    runAllTests: '모든 테스트 실행',
    running: '실행 중',
    results: '결과',
    pass: '통과',
    fail: '실패',
    skip: '건너뜀',
    testCoverage: '테스트 범위',
    testCoverageList: '• 네트워크 설정 및 상태\n• 지갑 생성 및 관리\n• 잔액 조회\n• 브릿지 기능 확인\n• Flashblocks 토글\n• GIWA ID 기능 확인\n• Dojang 증명 확인\n• Faucet 가용성\n• 전체 기능 요약',
    language: '언어',
    korean: '한국어',
    english: 'English',

    // Test names
    testNetworkInfo: '네트워크 정보',
    testWalletCreate: '지갑 생성',
    testExportMnemonic: '복구 문구 내보내기',
    testExportPrivateKey: '개인키 내보내기',
    testBalanceQuery: '잔액 조회',
    testBridgeAvailable: '브릿지 사용 가능',
    testFlashblocks: 'Flashblocks',
    testGiwaIdAvailable: 'GIWA ID 사용 가능',
    testDojangAvailable: 'Dojang 사용 가능',
    testFaucetAvailable: 'Faucet 사용 가능',
    testFeatureSummary: '기능 요약',
    walletExists: '지갑이 이미 존재함',
    noWallet: '지갑 없음',
    networkConfigUnavailable: '네트워크 설정을 사용할 수 없음',
    exportFailed: '내보내기 실패',
    toggleWorking: '토글 작동 중',
    notAvailableOnNetwork: '이 네트워크에서 사용 불가',
    mainnetFaucetUnavailable: '메인넷 - faucet 사용 불가',
    featuresAvailable: '개 기능 사용 가능',
    words: '개 단어',
  },
  en: {
    // Common
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    copy: 'Copy',
    copied: 'Copied',
    copiedToClipboard: 'Copied to clipboard',
    loading: 'Loading...',
    refresh: 'Refresh',
    delete: 'Delete',
    save: 'Save',
    done: 'Done',
    yes: 'Yes',
    no: 'No',

    // Tabs
    tabHome: 'Home',
    tabAssets: 'Assets',
    tabTransfer: 'Transfer',
    tabServices: 'Services',
    tabSettings: 'Settings',

    // Home Screen
    homeTitle: 'GIWA Wallet',
    homeSubtitle: 'Create or import a wallet to get started',
    balance: 'Balance',
    balanceRefresh: 'Refresh Balance',
    walletAddress: 'Wallet Address',
    copyAddress: 'Copy Address',
    walletManagement: 'Wallet Management',
    exportMnemonic: 'Export Mnemonic',
    exportPrivateKey: 'Export Private Key',
    deleteWallet: 'Delete Wallet',
    walletSecurity: 'Wallet Security',
    securityTip1: 'Private keys are stored securely on this device',
    securityTip2: 'Always backup your recovery phrase',
    securityTip3: 'Never share your private key or mnemonic',
    createNewWallet: 'Create New Wallet',
    recoverWithMnemonic: 'Recover with Mnemonic',
    importPrivateKey: 'Import Private Key',
    saveRecoveryPhrase: 'Save Recovery Phrase',
    recoveryPhraseWarning: 'Write down these 12 words in order. Never share them with anyone!',
    iSavedIt: "I've Saved It",
    recoverWallet: 'Recover Wallet',
    importWalletTitle: 'Import Private Key',
    enterMnemonic: 'Enter your 12-word recovery phrase',
    enterPrivateKey: 'Enter your private key (with 0x prefix)',
    recover: 'Recover',
    import: 'Import',
    exportedCredentials: 'Exported Credentials',
    neverShareWarning: 'Never share these credentials with anyone!',
    securityWarning: 'Security Warning',
    securityWarningMessage: 'Your wallet credentials will be displayed. Make sure no one is watching.',
    continue: 'Continue',
    deleteWalletConfirm: 'Delete Wallet',
    deleteWalletMessage: 'Are you sure you want to delete your wallet? Make sure you have backed up your recovery phrase.',
    walletDeleted: 'Wallet deleted',
    walletRecovered: 'Wallet recovered successfully',
    walletImported: 'Wallet imported successfully',
    noMnemonic: 'No mnemonic available (imported via private key)',
    sdkInitializing: 'Initializing SDK...',
    testnet: 'Testnet',
    mainnet: 'Mainnet',

    // Assets Screen
    assetsTitle: 'Token Management',
    addToken: 'Add Token',
    tokenContractAddress: 'Token contract address (0x...)',
    myTokens: 'My Tokens',
    noTokensYet: 'No tokens added yet',
    tapToSelectLongPressRemove: 'Tap to select, long press to remove',
    transfer: 'Transfer',
    tokenBalance: 'Balance',
    recipientAddress: 'Recipient address (0x...)',
    amount: 'Amount',
    removeToken: 'Remove Token',
    removeTokenConfirm: 'Are you sure you want to remove this token?',
    remove: 'Remove',
    tokenAdded: 'Added',
    transactionSent: 'Transaction sent!',

    // Transfer Screen
    transferTitle: 'Transfer',
    sendEth: 'Send ETH',
    l1Bridge: 'L1 Bridge',
    preparing: 'Preparing',
    availableBalance: 'Available Balance',
    l2Balance: 'L2 Balance',
    recipientAddressLabel: 'Recipient Address',
    amountEth: 'Amount (ETH)',
    sendEthButton: 'Send ETH',
    estimatedTime: 'Estimated Time',
    estimatedTimeValue: '~7 minutes',
    estimatedTimeDescription: 'Withdrawals require time for security.',
    l1RecipientOptional: 'L1 Recipient (optional)',
    leaveEmptyForCurrentAddress: 'Leave empty to use your current address',
    withdrawToL1: 'Withdraw to L1',
    transactionStatus: 'Transaction Status',
    transactionHash: 'Transaction Hash',
    sendingTransaction: 'Sending transaction...',
    transactionSentWaiting: 'Transaction sent! Waiting for confirmation...',
    confirmedInBlock: 'Confirmed in block',
    statusSuccess: 'Success',
    statusFailed: 'Failed',
    gasUsed: 'Gas used',
    withdrawalStarted: 'Initiating withdrawal...',
    withdrawalInitiated: 'Withdrawal initiated!',
    sendTips: 'Transaction Tips',
    sendTip1: 'Transactions are sent on GIWA Chain (L2)',
    sendTip2: 'Gas fees are paid in ETH',
    sendTip3: 'Confirmation usually takes a few seconds',
    bridgeTips: 'Bridge Tips',
    bridgeTip1: 'Withdrawals are not instant',
    bridgeTip2: 'Once initiated, withdrawals cannot be cancelled',
    bridgeTip3: 'Make sure the recipient address is correct',
    invalidAddressFormat: 'Invalid address format',
    invalidAmount: 'Invalid amount',
    fillAllFields: 'Please fill in all fields',

    // Services Screen
    servicesTitle: 'Services',
    faucet: 'Faucet',
    flashblocks: 'Flashblocks',
    giwaId: 'GIWA ID',
    dojang: 'Dojang',
    faucetNotAvailable: 'Faucet Not Available',
    faucetTestnetOnly: 'The faucet is only available on testnet.',
    currentBalance: 'Current Balance',
    myAddress: 'My Address',
    requestTestnetEth: 'Request Testnet ETH',
    refreshBalance: 'Refresh Balance',
    aboutTestnetEth: 'About Testnet ETH',
    testnetEthDescription: 'Testnet ETH has no real value and is used for testing purposes only.',
    faucetOpened: 'Faucet',
    faucetOpenedMessage: 'Faucet page opened in your browser. After receiving tokens, tap "Refresh Balance" to see your updated balance.',
    flashblocksToggle: 'Flashblocks',
    fastTransactionsEnabled: 'Fast transactions enabled',
    enableForFastTransactions: 'Enable for faster transactions',
    avgLatency: 'Avg Latency',
    sendWithFlashblocks: 'Send with Flashblocks',
    enableFlashblocksFirst: 'Enable Flashblocks First',
    preconfirmedIn: ' preconfirmed!',
    hash: 'Hash',
    flashblocksHowItWorks: 'How Flashblocks Works',
    flashblocksStep1: '1. Your transaction is sent to the Flashblocks RPC',
    flashblocksStep2: '2. You receive a preconfirmation in ~200ms',
    flashblocksStep3: '3. The transaction is included in the next block',
    giwaIdLookup: 'GIWA ID Lookup',
    exampleGiwaId: 'e.g., alice.giwa',
    lookupAddress: 'Lookup Address',
    checkAvailability: 'Check Availability',
    available: 'Available',
    taken: 'Taken',
    notFound: ' not found',
    aboutGiwaId: 'About GIWA ID',
    giwaIdDescription: 'GIWA ID is an ENS-based naming system. It allows you to use human-readable names like "alice.giwa" instead of long addresses.',
    attestationUid: 'Attestation UID',
    checkAttestationValidity: 'Check Attestation Validity',
    checkMyVerificationStatus: 'Check My Verification Status',
    attestationValid: 'Attestation is valid',
    attestationInvalid: 'Attestation is invalid',
    myAddressVerified: 'My address is verified',
    myAddressNotVerified: 'My address is not verified',
    aboutDojang: 'About Dojang',
    dojangDescription: "Dojang is GIWA Chain's EAS-based attestation system.\n\n- Identity verification\n- Balance attestations\n- On-chain reputation building",
    result: 'Result',
    networkNotAvailable: 'Not available on this network',

    // Settings Screen
    settingsTitle: 'Settings',
    networkInfo: 'Network Info',
    sdkTest: 'SDK Test',
    networkStatus: 'Network Status',
    network: 'Network',
    name: 'Name',
    chainId: 'Chain ID',
    type: 'Type',
    status: 'Status',
    ready: 'Ready',
    notReady: 'Not Ready',
    networkWarnings: 'Network Warnings',
    featureAvailability: 'Feature Availability',
    bridge: 'Bridge (L1↔L2)',
    rpcEndpoints: 'RPC Endpoints',
    show: 'Show',
    hide: 'Hide',
    rpcUrl: 'RPC URL',
    blockExplorer: 'Block Explorer',
    tapToCopyTapExplorerToOpen: 'Tap to copy, tap explorer to open',
    walletStatus: 'Wallet Status',
    connected: 'Connected',
    address: 'Address',
    sdkInfo: 'SDK Information',
    sdkInfoText: 'GIWA React Native Wallet SDK\nVersion: 0.1.0\n\nThis is a test application for validating all SDK features including wallet management, transactions, bridge operations, flashblocks, GIWA ID, and Dojang attestations.',
    runAllTests: 'Run All Tests',
    running: 'Running',
    results: 'Results',
    pass: 'Pass',
    fail: 'Fail',
    skip: 'Skip',
    testCoverage: 'Test Coverage',
    testCoverageList: '• Network configuration and status\n• Wallet creation and management\n• Balance queries\n• Bridge feature check\n• Flashblocks toggle\n• GIWA ID feature check\n• Dojang attestation check\n• Faucet availability\n• Overall feature summary',
    language: 'Language',
    korean: '한국어',
    english: 'English',

    // Test names
    testNetworkInfo: 'Network Info',
    testWalletCreate: 'Wallet Create',
    testExportMnemonic: 'Export Mnemonic',
    testExportPrivateKey: 'Export Private Key',
    testBalanceQuery: 'Balance Query',
    testBridgeAvailable: 'Bridge Available',
    testFlashblocks: 'Flashblocks',
    testGiwaIdAvailable: 'GIWA ID Available',
    testDojangAvailable: 'Dojang Available',
    testFaucetAvailable: 'Faucet Available',
    testFeatureSummary: 'Feature Summary',
    walletExists: 'Wallet already exists',
    noWallet: 'No wallet',
    networkConfigUnavailable: 'Network config not available',
    exportFailed: 'Failed to export',
    toggleWorking: 'Toggle working',
    notAvailableOnNetwork: 'Not available on this network',
    mainnetFaucetUnavailable: 'Mainnet - faucet not available',
    featuresAvailable: ' features available',
    words: ' words',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: TranslationStrings;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@giwa_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ko');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved language on mount
  React.useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage === 'en' || savedLanguage === 'ko') {
          setLanguageState(savedLanguage);
        }
      } catch (error) {
        console.error('Failed to load language:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  }, []);

  const t = translations[language];

  if (!isLoaded) {
    return null; // Or a loading indicator
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export { translations };

export type Lang = 'zh' | 'en';

type TranslationKeys = {
  appTitle: string;
  appSubtitle: string;
  lastDraw: string;
  jackpotEstimate: string;
  currentGenerated: string;
  fortuneText: string;
  generate: string;
  history: string;
  analysis: string;
  favorite: string;
  historyTitle: string;
  noHistory: string;
  favoriteTitle: string;
  noFavorite: string;
  analysisTitle: string;
  recentDraws: string;
  distribution: string;
  loading: string;
  noData: string;
  networkError: string;
  fetchError: string;
  frequencyTitle: string;
  hotNumbers: string;
  times: string;
  colorStats: string;
  redWave: string;
  blueWave: string;
  greenWave: string;
  settings: string;
  language: string;
  drawPrefix: string;
  modeRandom: string;
  modeFortune: string;
  yourZodiac: string;
  birthHour: string;
  zodiacRat: string;
  zodiacOx: string;
  zodiacTiger: string;
  zodiacRabbit: string;
  zodiacDragon: string;
  zodiacSnake: string;
  zodiacHorse: string;
  zodiacGoat: string;
  zodiacMonkey: string;
  zodiacRooster: string;
  zodiacDog: string;
  zodiacPig: string;
  hourZi: string;
  hourChou: string;
  hourYin: string;
  hourMao: string;
  hourChen: string;
  hourSi: string;
  hourWu: string;
  hourWei: string;
  hourShen: string;
  hourYou: string;
  hourXu: string;
  hourHai: string;
  modeBanker: string;
  modeMultiple: string;
  bankerCount: string;
  playerCount: string;
  totalCount: string;
  redBalls: string;
  blueBalls: string;
  greenBalls: string;
  banker: string;
  player: string;
  colorSelection: string;
  dividendPerUnit: string;
  winningUnits: string;
  nextDrawInfo: string;
  noWinner: string;
  useColorFilter: string;
  disclaimerTitle: string;
  acceptContinue: string;
  scrollToAccept: string;
  privacyPolicy: string;
  about: string;
  version: string;
  resetAppData: string;
  confirmReset: string;
};

export const translations: Record<Lang, TranslationKeys> = {
  zh: {
    appTitle: '香港六合彩',
    appSubtitle: '傳統求籤機',
    lastDraw: '上期開獎結果',
    jackpotEstimate: '下期頭獎預估',
    currentGenerated: '本次生成號碼',
    fortuneText: '誠心求籤，必有後福',
    generate: '求籤',
    history: '歷史記錄',
    analysis: '開獎記錄',
    favorite: '收藏',
    historyTitle: '歷史記錄',
    noHistory: '尚無記錄，請先求籤',
    favoriteTitle: '我的收藏',
    noFavorite: '尚無收藏',
    analysisTitle: '開獎記錄',
    recentDraws: '最近 {n} 期',
    distribution: '號碼分佈',
    loading: '正在載入開獎記錄...',
    noData: '暫無開獎記錄',
    networkError: '網絡錯誤，請檢查連線',
    fetchError: '無法取得資料',
    frequencyTitle: '號碼頻率分佈',
    hotNumbers: '最熱門 10 個號碼',
    times: '{count} 次',
    colorStats: '色波統計',
    redWave: '紅波',
    blueWave: '藍波',
    greenWave: '綠波',
    settings: '設定',
    language: '語言',
    drawPrefix: '第 {n} 期',
    modeRandom: '隨機',
    modeFortune: '命理',
    yourZodiac: '你的生肖',
    birthHour: '出生時辰',
    zodiacRat: '鼠',
    zodiacOx: '牛',
    zodiacTiger: '虎',
    zodiacRabbit: '兔',
    zodiacDragon: '龍',
    zodiacSnake: '蛇',
    zodiacHorse: '馬',
    zodiacGoat: '羊',
    zodiacMonkey: '猴',
    zodiacRooster: '雞',
    zodiacDog: '狗',
    zodiacPig: '豬',
    hourZi: '子時',
    hourChou: '丑時',
    hourYin: '寅時',
    hourMao: '卯時',
    hourChen: '辰時',
    hourSi: '巳時',
    hourWu: '午時',
    hourWei: '未時',
    hourShen: '申時',
    hourYou: '酉時',
    hourXu: '戌時',
    hourHai: '亥時',
    modeBanker: '膽拖',
    modeMultiple: '複式',
    bankerCount: '膽碼數量',
    playerCount: '腳碼數量',
    totalCount: '號碼數量',
    redBalls: '紅',
    blueBalls: '藍',
    greenBalls: '綠',
    banker: '膽',
    player: '拖',
    colorSelection: '色波選擇',
    dividendPerUnit: '每注獎金',
    winningUnits: '中獎注數',
    nextDrawInfo: '下期搞珠',
    noWinner: '無人中獎',
    useColorFilter: '色波篩選',
    disclaimerTitle: '免責聲明 / Disclaimer',
    acceptContinue: '接受並繼續 / Accept & Continue',
    scrollToAccept: '請捲動至底部以啟用按鈕',
    privacyPolicy: '隱私政策',
    about: '關於',
    version: '版本',
    resetAppData: '重置應用程式資料',
    confirmReset: '確定要清除所有收藏記錄並重新顯示特免責聲明嗎？',
  },
  en: {
    appTitle: 'Mark Six',
    appSubtitle: 'TRADITIONAL FORTUNE GENERATOR',
    lastDraw: 'LAST DRAW RESULT',
    jackpotEstimate: 'NEXT JACKPOT ESTIMATE',
    currentGenerated: 'CURRENT GENERATED NUMBERS',
    fortuneText: 'May fortune smile upon you',
    generate: 'Generate',
    history: 'History',
    analysis: 'Analysis',
    favorite: 'Favorite',
    historyTitle: 'History',
    noHistory: 'No records yet',
    favoriteTitle: 'My Favorites',
    noFavorite: 'No favorites yet',
    analysisTitle: 'Draw Results',
    recentDraws: 'Last {n}',
    distribution: 'Distribution',
    loading: 'Loading draw results...',
    noData: 'No draw results',
    networkError: 'Network error',
    fetchError: 'Failed to fetch data',
    frequencyTitle: 'Number Frequency',
    hotNumbers: 'Top 10 Hot Numbers',
    times: '{count}x',
    colorStats: 'Color Stats',
    redWave: 'Red',
    blueWave: 'Blue',
    greenWave: 'Green',
    settings: 'Settings',
    language: 'Language',
    drawPrefix: 'Draw #{n}',
    modeRandom: 'Random',
    modeFortune: 'Fortune',
    yourZodiac: 'Your Zodiac',
    birthHour: 'Birth Hour',
    zodiacRat: 'Rat',
    zodiacOx: 'Ox',
    zodiacTiger: 'Tiger',
    zodiacRabbit: 'Rabbit',
    zodiacDragon: 'Dragon',
    zodiacSnake: 'Snake',
    zodiacHorse: 'Horse',
    zodiacGoat: 'Goat',
    zodiacMonkey: 'Monkey',
    zodiacRooster: 'Rooster',
    zodiacDog: 'Dog',
    zodiacPig: 'Pig',
    hourZi: 'Zi',
    hourChou: 'Chou',
    hourYin: 'Yin',
    hourMao: 'Mao',
    hourChen: 'Chen',
    hourSi: 'Si',
    hourWu: 'Wu',
    hourWei: 'Wei',
    hourShen: 'Shen',
    hourYou: 'You',
    hourXu: 'Xu',
    hourHai: 'Hai',
    modeBanker: 'Banker',
    modeMultiple: 'Multiple',
    bankerCount: 'Banker Count',
    playerCount: 'Player Count',
    totalCount: 'Total Count',
    redBalls: 'Red',
    blueBalls: 'Blue',
    greenBalls: 'Green',
    banker: 'Banker',
    player: 'Player',
    colorSelection: 'Color Selection',
    dividendPerUnit: 'Dividend',
    winningUnits: 'Winners',
    nextDrawInfo: 'Next Draw',
    noWinner: 'No Winner',
    useColorFilter: 'Color Filter',
    disclaimerTitle: 'Disclaimer',
    acceptContinue: 'Accept & Continue',
    scrollToAccept: 'Please scroll to the bottom to enable the button',
    privacyPolicy: 'Privacy Policy',
    about: 'About',
    version: 'Version',
    resetAppData: 'Reset App Data',
    confirmReset: 'Are you sure you want to clear all data and show the disclaimer again?',
  },
};

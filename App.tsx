import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { BannerAdComponent } from './src/components/BannerAdComponent';
import { isExpoGo, AD_UNIT_IDS, INTERSTITIAL_FREQUENCY } from './src/utils/adConfig';
import { Ball } from './src/components/Ball';
import { generateMarkSixNumbers, generateBankerNumbers, generateMultipleNumbers, generateColorConstrainedNumbers, distributeColors, RED_BALLS, BLUE_BALLS, GREEN_BALLS } from './src/utils/lotteryUtils';
import { generateZodiacNumbers, ZODIAC_LIST, HOUR_LIST, Zodiac, ChineseHour } from './src/utils/zodiacUtils';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ApiResponse, HistoryEntry, MarkSixResult, FavoriteEntry, BankerConfig, MultipleConfig, ColorDistribution } from './src/types/lottery';
import { getCache, setCache } from './src/utils/cacheUtils';
import { CountStepper } from './src/components/CountStepper';
import { ColorStepper } from './src/components/ColorStepper';
import { HistoryModal } from './src/components/HistoryModal';
import { AnalysisModal } from './src/components/AnalysisModal';
import { FavoriteModal } from './src/components/FavoriteModal';
import { SettingsModal } from './src/components/SettingsModal';
import { DisclaimerModal } from './src/components/DisclaimerModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageProvider, useTranslation } from './src/i18n/LanguageContext';
import { apiFetch, getApiUrl } from './src/utils/apiClient';
import { scale } from './src/utils/scale';

const formatJackpot = (amount: number): string => {
  return amount.toLocaleString();
};

const formatDrawDate = (dateStr: string): string => {
  return dateStr.split(/[T+]/)[0];
};

function AppContent() {
  const { t } = useTranslation();
  const [currentNumbers, setCurrentNumbers] = useState<number[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [analysisVisible, setAnalysisVisible] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [favoriteVisible, setFavoriteVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [lastDraw, setLastDraw] = useState<MarkSixResult | null>(null);
  const [jackpot, setJackpot] = useState<number | null>(null);
  const [drawLoading, setDrawLoading] = useState(true);
  const [mode, setMode] = useState<'random' | 'zodiac' | 'banker' | 'multiple'>('random');
  const [selectedZodiac, setSelectedZodiac] = useState<Zodiac>('rat');
  const [selectedHour, setSelectedHour] = useState<ChineseHour>('zi');
  const [bankerConfig, setBankerConfig] = useState<BankerConfig>({
    bankerCount: 4,
    bankerColors: distributeColors(4),
    playerCount: 3,
    playerColors: distributeColors(3),
  });
  const [multipleConfig, setMultipleConfig] = useState<MultipleConfig>({
    totalCount: 8,
    colors: distributeColors(8),
  });
  const [bankerResult, setBankerResult] = useState<{ bankers: number[]; players: number[] } | null>(null);
  const [useColorFilter, setUseColorFilter] = useState(false);
  const [randomColors, setRandomColors] = useState<ColorDistribution>(distributeColors(6));
  const [disclaimerVisible, setDisclaimerVisible] = useState(true);
  const generateCountRef = useRef(0);
  const interstitialRef = useRef<any>(null);

  useEffect(() => {
    if (isExpoGo) return;
    const { InterstitialAd, AdEventType } = require('react-native-google-mobile-ads');
    const ad = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial);
    interstitialRef.current = ad;
    const unsubscribe = ad.addAdEventListener(AdEventType.CLOSED, () => {
      ad.load();
    });
    ad.load();
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadStored = async () => {
      try {
        const [storedFav, storedZodiac, storedHour, disclaimerAccepted] = await Promise.all([
          AsyncStorage.getItem('favorites'),
          AsyncStorage.getItem('zodiac'),
          AsyncStorage.getItem('hour'),
          AsyncStorage.getItem('disclaimerAccepted'),
        ]);
        if (disclaimerAccepted === 'true') setDisclaimerVisible(false);
        if (storedFav) {
          const parsed: FavoriteEntry[] = JSON.parse(storedFav, (key, value) =>
            key === 'timestamp' ? new Date(value) : value,
          );
          setFavorites(parsed);
        }
        if (storedZodiac) setSelectedZodiac(storedZodiac as Zodiac);
        if (storedHour) setSelectedHour(storedHour as ChineseHour);
      } catch {
        // Silently fail
      }
    };
    loadStored();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('favorites', JSON.stringify(favorites)).catch(() => { });
  }, [favorites]);

  useEffect(() => {
    const fetchDrawData = async () => {
      const cacheKey = 'lastDraw';
      const cached = await getCache<MarkSixResult>(cacheKey);
      if (cached) {
        setLastDraw(cached);
        if (cached.nextDraw?.estimatedJackpot) {
          setJackpot(cached.nextDraw.estimatedJackpot);
        }
        setDrawLoading(false);
        return;
      }
      try {
        const json = await apiFetch<ApiResponse>('');
        if (json.success && json.data) {
          setLastDraw(json.data);
          if (json.data.nextDraw?.estimatedJackpot) {
            setJackpot(json.data.nextDraw.estimatedJackpot);
          }
          setCache(cacheKey, json.data);
        }
      } catch {
        // Silently fail
      } finally {
        setDrawLoading(false);
      }
    };
    fetchDrawData();
  }, []);

  const handleAcceptDisclaimer = useCallback(() => {
    setDisclaimerVisible(false);
    AsyncStorage.setItem('disclaimerAccepted', 'true').catch(() => { });
  }, []);

  const handleGenerate = useCallback(() => {
    let newNumbers: number[];
    let newBankerResult: { bankers: number[]; players: number[] } | null = null;
    let entryBankerCount: number | undefined;

    if (mode === 'banker') {
      const result = generateBankerNumbers(bankerConfig, useColorFilter);
      newBankerResult = result;
      newNumbers = [...result.bankers, ...result.players];
      entryBankerCount = result.bankers.length;
    } else if (mode === 'multiple') {
      newNumbers = generateMultipleNumbers(multipleConfig, useColorFilter);
    } else if (mode === 'zodiac') {
      newNumbers = generateZodiacNumbers(selectedZodiac, selectedHour);
    } else {
      // Random mode
      if (useColorFilter) {
        newNumbers = generateColorConstrainedNumbers(randomColors);
      } else {
        newNumbers = generateMarkSixNumbers();
      }
    }

    setCurrentNumbers(newNumbers);
    setBankerResult(newBankerResult);

    generateCountRef.current += 1;
    if (generateCountRef.current % INTERSTITIAL_FREQUENCY === 0 && interstitialRef.current?.loaded) {
      interstitialRef.current.show();
    }

    setHistory((prev) => {
      const entry: HistoryEntry = {
        id: Date.now(),
        numbers: newNumbers,
        timestamp: new Date(),
        bankerCount: entryBankerCount,
      };
      const updated = [entry, ...prev];
      return updated.length > 10 ? updated.slice(0, 10) : updated;
    });
  }, [mode, selectedZodiac, selectedHour, bankerConfig, multipleConfig, useColorFilter, randomColors]);

  const handleSelectZodiac = useCallback((z: Zodiac) => {
    setSelectedZodiac(z);
    AsyncStorage.setItem('zodiac', z).catch(() => { });
  }, []);

  const handleSelectHour = useCallback((h: ChineseHour) => {
    setSelectedHour(h);
    AsyncStorage.setItem('hour', h).catch(() => { });
  }, []);

  const zodiacTranslationKey = useCallback((key: string): string => {
    const map: Record<string, string> = {
      rat: 'zodiacRat', ox: 'zodiacOx', tiger: 'zodiacTiger', rabbit: 'zodiacRabbit',
      dragon: 'zodiacDragon', snake: 'zodiacSnake', horse: 'zodiacHorse', goat: 'zodiacGoat',
      monkey: 'zodiacMonkey', rooster: 'zodiacRooster', dog: 'zodiacDog', pig: 'zodiacPig',
    };
    return map[key] || key;
  }, []);

  const hourTranslationKey = useCallback((key: string): string => {
    const map: Record<string, string> = {
      zi: 'hourZi', chou: 'hourChou', yin: 'hourYin', mao: 'hourMao',
      chen: 'hourChen', si: 'hourSi', wu: 'hourWu', wei: 'hourWei',
      shen: 'hourShen', you: 'hourYou', xu: 'hourXu', hai: 'hourHai',
    };
    return map[key] || key;
  }, []);

  const updateBankerCount = useCallback((field: 'bankerCount' | 'playerCount', value: number) => {
    setBankerConfig((prev) => {
      const otherField = field === 'bankerCount' ? 'playerCount' : 'bankerCount';
      const otherColorsField = field === 'bankerCount' ? 'playerColors' : 'bankerColors';
      let otherValue = prev[otherField];
      // Ensure banker + player >= 7
      if (value + otherValue < 7) {
        otherValue = 7 - value;
      }
      return {
        ...prev,
        [field]: value,
        [field === 'bankerCount' ? 'bankerColors' : 'playerColors']: distributeColors(value),
        [otherField]: otherValue,
        [otherColorsField]: otherValue !== prev[otherField] ? distributeColors(otherValue) : prev[otherColorsField],
      };
    });
  }, []);

  const updateBankerColor = useCallback(
    (group: 'bankerColors' | 'playerColors', colorKey: keyof ColorDistribution, value: number) => {
      setBankerConfig((prev) => {
        const colors = { ...prev[group], [colorKey]: value };
        const total = group === 'bankerColors' ? prev.bankerCount : prev.playerCount;
        const otherKeys = (['red', 'blue', 'green'] as const).filter((k) => k !== colorKey);
        const remaining = total - value;
        const pools = { red: RED_BALLS.length, blue: BLUE_BALLS.length, green: GREEN_BALLS.length };

        // Redistribute remaining among other keys
        let leftover = remaining;
        for (const k of otherKeys) {
          const maxForK = Math.min(pools[k], leftover);
          colors[k] = Math.min(colors[k], maxForK);
          leftover -= colors[k];
        }
        // If still leftover, assign to first available
        if (leftover > 0) {
          for (const k of otherKeys) {
            const canAdd = Math.min(pools[k] - colors[k], leftover);
            colors[k] += canAdd;
            leftover -= canAdd;
          }
        }

        return { ...prev, [group]: colors };
      });
    },
    [],
  );

  const updateMultipleCount = useCallback((value: number) => {
    setMultipleConfig({ totalCount: value, colors: distributeColors(value) });
  }, []);

  const updateMultipleColor = useCallback(
    (colorKey: keyof ColorDistribution, value: number) => {
      setMultipleConfig((prev) => {
        const colors = { ...prev.colors, [colorKey]: value };
        const otherKeys = (['red', 'blue', 'green'] as const).filter((k) => k !== colorKey);
        const remaining = prev.totalCount - value;
        const pools = { red: RED_BALLS.length, blue: BLUE_BALLS.length, green: GREEN_BALLS.length };

        let leftover = remaining;
        for (const k of otherKeys) {
          const maxForK = Math.min(pools[k], leftover);
          colors[k] = Math.min(colors[k], maxForK);
          leftover -= colors[k];
        }
        if (leftover > 0) {
          for (const k of otherKeys) {
            const canAdd = Math.min(pools[k] - colors[k], leftover);
            colors[k] += canAdd;
            leftover -= canAdd;
          }
        }

        return { ...prev, colors };
      });
    },
    [],
  );

  const updateRandomColor = useCallback(
    (colorKey: keyof ColorDistribution, value: number) => {
      setRandomColors((prev) => {
        const colors = { ...prev, [colorKey]: value };
        const otherKeys = (['red', 'blue', 'green'] as const).filter((k) => k !== colorKey);
        const remaining = 6 - value;
        const pools = { red: RED_BALLS.length, blue: BLUE_BALLS.length, green: GREEN_BALLS.length };

        let leftover = remaining;
        for (const k of otherKeys) {
          const maxForK = Math.min(pools[k], leftover);
          colors[k] = Math.min(colors[k], maxForK);
          leftover -= colors[k];
        }
        if (leftover > 0) {
          for (const k of otherKeys) {
            const canAdd = Math.min(pools[k] - colors[k], leftover);
            colors[k] += canAdd;
            leftover -= canAdd;
          }
        }

        return colors;
      });
    },
    [],
  );

  const isFavorited = useMemo(() => {
    if (currentNumbers.length === 0) return false;
    const key = currentNumbers.join(',');
    return favorites.some((f) => f.numbers.join(',') === key);
  }, [currentNumbers, favorites]);

  const handleAddFavorite = useCallback(() => {
    if (currentNumbers.length === 0) return;
    const key = currentNumbers.join(',');
    const exists = favorites.some((f) => f.numbers.join(',') === key);
    if (exists) {
      setFavorites((prev) => prev.filter((f) => f.numbers.join(',') !== key));
    } else {
      setFavorites((prev) => [
        {
          id: Date.now(),
          numbers: [...currentNumbers],
          timestamp: new Date(),
          bankerCount: bankerResult ? bankerResult.bankers.length : undefined,
        },
        ...prev,
      ]);
    }
  }, [currentNumbers, favorites, bankerResult]);

  const handleRemoveFavorite = useCallback((id: number) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const favoriteKeys = useMemo(
    () => new Set(favorites.map((f) => f.numbers.join(','))),
    [favorites],
  );

  const handleToggleFavorite = useCallback((numbers: number[], bankerCount?: number) => {
    const key = numbers.join(',');
    setFavorites((prev) => {
      const exists = prev.some((f) => f.numbers.join(',') === key);
      if (exists) return prev.filter((f) => f.numbers.join(',') !== key);
      return [{ id: Date.now(), numbers: [...numbers], timestamp: new Date(), bankerCount }, ...prev];
    });
  }, []);

  const ballList = useMemo(() => {
    return currentNumbers.map((num) => (
      <Ball key={num} number={num} />
    ));
  }, [currentNumbers]);

  return (
    <View style={styles.fullScreen}>
      <StatusBar barStyle="light-content" />

      <View style={styles.silkBackground}>
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>

            {/* Header with Settings */}
            <View style={styles.header}>
              <View style={{ width: 40 }} />
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => setSettingsVisible(true)}>
                <Ionicons name="settings-outline" size={24} color="#fcd34d" />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.mainTitle}>{t('appTitle')}</Text>
              <View style={styles.titleUnderline} />
              <Text style={styles.subTitle}>{t('appSubtitle')}</Text>
            </View>

            {/* Last Draw Result Card */}
            {drawLoading ? (
              <ActivityIndicator color="#fcd34d" style={{ marginBottom: 16 }} />
            ) : lastDraw ? (
              <View style={styles.card}>
                <View style={[styles.corner, styles.tl]} />
                <View style={[styles.corner, styles.tr]} />
                <View style={[styles.corner, styles.bl]} />
                <View style={[styles.corner, styles.br]} />

                <Text style={styles.cardTitle}>{t('lastDraw')}</Text>
                <Text style={styles.cardSubtitle}>
                  {t('drawPrefix', { n: lastDraw.drawNumber })} · {formatDrawDate(lastDraw.drawDate)}
                </Text>

                <View style={styles.lastDrawBalls}>
                  {lastDraw.numbers.map((num, i) => (
                    <Ball key={`last-${num}-${i}`} number={Number(num)} size="small" />
                  ))}
                  <Text style={styles.lastDrawPlus}>+</Text>
                  <Ball key="extra" number={Number(lastDraw.extraNumber)} size="small" />
                </View>

                {lastDraw.payoutDetails.length > 0 && (
                  <View style={styles.payoutTable}>
                    <View style={styles.payoutRow}>
                      <Text style={[styles.payoutLabel, { flex: 2 }]} />
                      <Text style={[styles.payoutLabel, { flex: 2, textAlign: 'right' }]}>{t('dividendPerUnit')}</Text>
                      <Text style={[styles.payoutLabel, { flex: 2, textAlign: 'right' }]}>{t('winningUnits')}</Text>
                    </View>
                    {lastDraw.payoutDetails.slice(0, 3).map((p, i) => (
                      <View key={i} style={styles.payoutRow}>
                        <Text style={[styles.payoutLabel, { flex: 2 }]}>{p.prizeLevel}</Text>
                        <Text style={[styles.payoutValue, { flex: 2, textAlign: 'right' }]}>
                          ${formatJackpot(p.dividend)}
                        </Text>
                        <Text style={[styles.payoutValue, { flex: 2, textAlign: 'right' }]}>
                          {p.winningUnits === 0 ? t('noWinner') : p.winningUnits.toLocaleString()}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : null}

            {/* Jackpot Card */}
            <View style={styles.card}>
              <View style={[styles.corner, styles.tl]} />
              <View style={[styles.corner, styles.tr]} />
              <View style={[styles.corner, styles.bl]} />
              <View style={[styles.corner, styles.br]} />

              <Text style={styles.jackpotLabel}>{t('jackpotEstimate')}</Text>
              {drawLoading ? (
                <ActivityIndicator color="#fcd34d" style={{ marginTop: 6 }} />
              ) : (
                <>
                  <View style={styles.jackpotRow}>
                    <Text style={styles.jackpotIcon}>💰</Text>
                    <Text style={styles.jackpotValue}>
                      <Text style={styles.goldSymbol}>$</Text>{' '}
                      {jackpot ? formatJackpot(jackpot) : '---'}
                    </Text>
                  </View>
                  {lastDraw?.nextDraw && (
                    <Text style={styles.nextDrawInfoText}>
                      {t('drawPrefix', { n: lastDraw.nextDraw.drawNumber })} · {formatDrawDate(lastDraw.nextDraw.drawDate)}
                    </Text>
                  )}
                </>
              )}
            </View>

            {/* Generated Numbers Section */}
            {currentNumbers.length > 0 && (
              <View style={styles.sectionRow}>
                <Text style={styles.sectionLabel}>{t('currentGenerated')}</Text>
                <TouchableOpacity onPress={handleAddFavorite} style={styles.starButton}>
                  <Ionicons
                    name={isFavorited ? 'star' : 'star-outline'}
                    size={22}
                    color="#fcd34d"
                  />
                </TouchableOpacity>
              </View>
            )}

            {currentNumbers.length > 0 && (
              <>
                <View style={styles.lanternArea}>
                  {mode === 'banker' && bankerResult ? (
                    <View style={styles.bankerDisplay}>
                      <View style={styles.bankerGroup}>
                        <Text style={styles.bankerGroupLabel}>{t('banker')}</Text>
                        <View style={styles.bankerBallRow}>
                          {bankerResult.bankers.map((num) => (
                            <Ball key={`b-${num}`} number={num} />
                          ))}
                        </View>
                      </View>
                      <View style={styles.bankerDivider} />
                      <View style={styles.bankerGroup}>
                        <Text style={styles.bankerGroupLabel}>{t('player')}</Text>
                        <View style={styles.bankerBallRow}>
                          {bankerResult.players.map((num) => (
                            <Ball key={`p-${num}`} number={num} />
                          ))}
                        </View>
                      </View>
                    </View>
                  ) : currentNumbers.length > 6 ? (
                    <View style={styles.multipleGrid}>
                      {currentNumbers.map((num) => (
                        <Ball key={num} number={num} />
                      ))}
                    </View>
                  ) : (
                    <View style={styles.lanternGrid}>
                      {ballList}
                    </View>
                  )}
                </View>

              </>
            )}

            {/* Fortune Text */}
            <Text style={styles.fortuneText}>{t('fortuneText')}</Text>

            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
              {([
                { key: 'random' as const, label: t('modeRandom') },
                { key: 'zodiac' as const, label: t('modeFortune') },
                { key: 'banker' as const, label: t('modeBanker') },
                { key: 'multiple' as const, label: t('modeMultiple') },
              ]).map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.modeTab, mode === m.key && styles.modeTabActive]}
                  onPress={() => setMode(m.key)}
                >
                  <Text style={[styles.modeTabText, mode === m.key && styles.modeTabTextActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Random Mode Color Panel */}
            {mode === 'random' && (
              <View style={styles.zodiacCard}>
                <TouchableOpacity
                  style={styles.colorFilterToggle}
                  onPress={() => setUseColorFilter((prev) => !prev)}
                >
                  <Text style={styles.colorFilterLabel}>{t('useColorFilter')}</Text>
                  <View style={[styles.colorFilterSwitch, useColorFilter && styles.colorFilterSwitchOn]}>
                    <View style={[styles.colorFilterKnob, useColorFilter && styles.colorFilterKnobOn]} />
                  </View>
                </TouchableOpacity>

                {useColorFilter && (
                  <>
                    <ColorStepper
                      label={t('redBalls')}
                      color="#FF3B30"
                      value={randomColors.red}
                      max={Math.min(RED_BALLS.length, 6)}
                      onChange={(v) => updateRandomColor('red', v)}
                    />
                    <ColorStepper
                      label={t('blueBalls')}
                      color="#007AFF"
                      value={randomColors.blue}
                      max={Math.min(BLUE_BALLS.length, 6)}
                      onChange={(v) => updateRandomColor('blue', v)}
                    />
                    <ColorStepper
                      label={t('greenBalls')}
                      color="#34C759"
                      value={randomColors.green}
                      max={Math.min(GREEN_BALLS.length, 6)}
                      onChange={(v) => updateRandomColor('green', v)}
                    />
                  </>
                )}
              </View>
            )}

            {/* Zodiac Selector (visible in zodiac mode) */}
            {mode === 'zodiac' && (
              <View style={styles.zodiacCard}>
                <Text style={styles.zodiacSectionLabel}>{t('yourZodiac')}</Text>
                <View style={styles.zodiacGrid}>
                  {ZODIAC_LIST.map((z) => (
                    <TouchableOpacity
                      key={z.key}
                      style={[
                        styles.zodiacItem,
                        selectedZodiac === z.key && styles.zodiacItemActive,
                      ]}
                      onPress={() => handleSelectZodiac(z.key)}
                    >
                      <Text style={styles.zodiacEmoji}>{z.emoji}</Text>
                      <Text style={[
                        styles.zodiacLabel,
                        selectedZodiac === z.key && styles.zodiacLabelActive,
                      ]}>
                        {t(zodiacTranslationKey(z.key))}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.zodiacSectionLabel, { marginTop: 14 }]}>{t('birthHour')}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.hourScroll}
                >
                  {HOUR_LIST.map((h) => (
                    <TouchableOpacity
                      key={h.key}
                      style={[
                        styles.hourPill,
                        selectedHour === h.key && styles.hourPillActive,
                      ]}
                      onPress={() => handleSelectHour(h.key)}
                    >
                      <Text style={[
                        styles.hourPillText,
                        selectedHour === h.key && styles.hourPillTextActive,
                      ]}>
                        {t(hourTranslationKey(h.key))}
                      </Text>
                      <Text style={styles.hourPillTime}>{h.time}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Banker Mode Panel */}
            {mode === 'banker' && (
              <View style={styles.zodiacCard}>
                <Text style={styles.zodiacSectionLabel}>{t('banker')}</Text>
                <CountStepper
                  label={t('bankerCount')}
                  value={bankerConfig.bankerCount}
                  min={Math.max(1, 7 - bankerConfig.playerCount)}
                  max={Math.min(5, 49 - bankerConfig.playerCount)}
                  onChange={(v) => updateBankerCount('bankerCount', v)}
                />

                <View style={styles.bankerSectionDivider} />

                <Text style={styles.zodiacSectionLabel}>{t('player')}</Text>
                <CountStepper
                  label={t('playerCount')}
                  value={bankerConfig.playerCount}
                  min={Math.max(1, 7 - bankerConfig.bankerCount)}
                  max={49 - bankerConfig.bankerCount}
                  onChange={(v) => updateBankerCount('playerCount', v)}
                />

                <View style={styles.bankerSectionDivider} />

                <TouchableOpacity
                  style={styles.colorFilterToggle}
                  onPress={() => setUseColorFilter((prev) => !prev)}
                >
                  <Text style={styles.colorFilterLabel}>{t('useColorFilter')}</Text>
                  <View style={[styles.colorFilterSwitch, useColorFilter && styles.colorFilterSwitchOn]}>
                    <View style={[styles.colorFilterKnob, useColorFilter && styles.colorFilterKnobOn]} />
                  </View>
                </TouchableOpacity>

                {useColorFilter && (
                  <>
                    <Text style={[styles.zodiacSectionLabel, { marginTop: 10 }]}>{t('banker')}</Text>
                    <ColorStepper
                      label={t('redBalls')}
                      color="#FF3B30"
                      value={bankerConfig.bankerColors.red}
                      max={Math.min(RED_BALLS.length, bankerConfig.bankerCount)}
                      onChange={(v) => updateBankerColor('bankerColors', 'red', v)}
                    />
                    <ColorStepper
                      label={t('blueBalls')}
                      color="#007AFF"
                      value={bankerConfig.bankerColors.blue}
                      max={Math.min(BLUE_BALLS.length, bankerConfig.bankerCount)}
                      onChange={(v) => updateBankerColor('bankerColors', 'blue', v)}
                    />
                    <ColorStepper
                      label={t('greenBalls')}
                      color="#34C759"
                      value={bankerConfig.bankerColors.green}
                      max={Math.min(GREEN_BALLS.length, bankerConfig.bankerCount)}
                      onChange={(v) => updateBankerColor('bankerColors', 'green', v)}
                    />

                    <View style={styles.bankerSectionDivider} />

                    <Text style={styles.zodiacSectionLabel}>{t('player')}</Text>
                    <ColorStepper
                      label={t('redBalls')}
                      color="#FF3B30"
                      value={bankerConfig.playerColors.red}
                      max={Math.min(RED_BALLS.length, bankerConfig.playerCount)}
                      onChange={(v) => updateBankerColor('playerColors', 'red', v)}
                    />
                    <ColorStepper
                      label={t('blueBalls')}
                      color="#007AFF"
                      value={bankerConfig.playerColors.blue}
                      max={Math.min(BLUE_BALLS.length, bankerConfig.playerCount)}
                      onChange={(v) => updateBankerColor('playerColors', 'blue', v)}
                    />
                    <ColorStepper
                      label={t('greenBalls')}
                      color="#34C759"
                      value={bankerConfig.playerColors.green}
                      max={Math.min(GREEN_BALLS.length, bankerConfig.playerCount)}
                      onChange={(v) => updateBankerColor('playerColors', 'green', v)}
                    />
                  </>
                )}
              </View>
            )}

            {/* Multiple Mode Panel */}
            {mode === 'multiple' && (
              <View style={styles.zodiacCard}>
                <Text style={styles.zodiacSectionLabel}>{t('totalCount')}</Text>
                <CountStepper
                  label={t('totalCount')}
                  value={multipleConfig.totalCount}
                  min={7}
                  max={49}
                  onChange={updateMultipleCount}
                />

                <View style={styles.bankerSectionDivider} />

                <TouchableOpacity
                  style={styles.colorFilterToggle}
                  onPress={() => setUseColorFilter((prev) => !prev)}
                >
                  <Text style={styles.colorFilterLabel}>{t('useColorFilter')}</Text>
                  <View style={[styles.colorFilterSwitch, useColorFilter && styles.colorFilterSwitchOn]}>
                    <View style={[styles.colorFilterKnob, useColorFilter && styles.colorFilterKnobOn]} />
                  </View>
                </TouchableOpacity>

                {useColorFilter && (
                  <>
                    <ColorStepper
                      label={t('redBalls')}
                      color="#FF3B30"
                      value={multipleConfig.colors.red}
                      max={Math.min(RED_BALLS.length, multipleConfig.totalCount)}
                      onChange={(v) => updateMultipleColor('red', v)}
                    />
                    <ColorStepper
                      label={t('blueBalls')}
                      color="#007AFF"
                      value={multipleConfig.colors.blue}
                      max={Math.min(BLUE_BALLS.length, multipleConfig.totalCount)}
                      onChange={(v) => updateMultipleColor('blue', v)}
                    />
                    <ColorStepper
                      label={t('greenBalls')}
                      color="#34C759"
                      value={multipleConfig.colors.green}
                      max={Math.min(GREEN_BALLS.length, multipleConfig.totalCount)}
                      onChange={(v) => updateMultipleColor('green', v)}
                    />
                  </>
                )}
              </View>
            )}

            {/* Generate Button */}
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerate}
              activeOpacity={0.8}
            >
              <View style={styles.buttonInner}>
                <MaterialCommunityIcons name="brush" size={22} color="#fcd34d" style={styles.brushIcon} />
                <Text style={styles.buttonText}>{t('generate')}</Text>
              </View>
            </TouchableOpacity>

          </ScrollView>

          {/* Banner Ad — placed above nav, not near generate button (AdMob policy) */}
          <BannerAdComponent />

          {/* Fixed Bottom Navigation */}
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem} onPress={() => setHistoryVisible(true)}>
              <MaterialCommunityIcons name="history" size={24} color="#fcd34d" />
              <Text style={styles.navText}>{t('history')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => setAnalysisVisible(true)}>
              <MaterialCommunityIcons name="chart-bell-curve" size={24} color="#fcd34d" />
              <Text style={styles.navText}>{t('analysis')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => setFavoriteVisible(true)}>
              <Ionicons name="star-outline" size={24} color="#fcd34d" />
              <Text style={styles.navText}>{t('favorite')}</Text>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </View>

      <HistoryModal
        visible={historyVisible}
        history={history}
        favoriteKeys={favoriteKeys}
        onClose={() => setHistoryVisible(false)}
        onToggleFavorite={handleToggleFavorite}
      />
      <AnalysisModal
        visible={analysisVisible}
        onClose={() => setAnalysisVisible(false)}
      />
      <FavoriteModal
        visible={favoriteVisible}
        favorites={favorites}
        onClose={() => setFavoriteVisible(false)}
        onRemove={handleRemoveFavorite}
      />
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onReset={() => {
          setDisclaimerVisible(true);
          setFavorites([]);
          setHistory([]);
        }}
      />
      <DisclaimerModal
        visible={disclaimerVisible}
        onAccept={handleAcceptDisclaimer}
      />
    </View>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#7f1d1d',
  },
  silkBackground: {
    flex: 1,
    backgroundColor: '#450a0a',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: scale(10),
    paddingBottom: scale(16),
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginBottom: 4,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
  },

  /* Title */
  titleContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: scale(36),
    fontWeight: '900',
    color: '#fcd34d',
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleUnderline: {
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    marginVertical: 6,
  },
  subTitle: {
    fontSize: scale(10),
    color: '#fcd34d',
    letterSpacing: 3,
    opacity: 0.8,
  },

  /* Shared Card Style */
  card: {
    width: '90%',
    backgroundColor: 'rgba(69, 10, 10, 0.9)',
    borderRadius: 12,
    paddingVertical: scale(14),
    paddingHorizontal: scale(16),
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    marginBottom: scale(10),
    alignItems: 'center',
    position: 'relative',
  },
  cardTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#fcd34d',
  },
  cardSubtitle: {
    fontSize: scale(12),
    color: 'rgba(252, 211, 77, 0.6)',
    marginTop: 3,
    marginBottom: 8,
  },

  /* Gold Corners */
  corner: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderColor: '#d4af37',
  },
  tl: { top: 6, left: 6, borderTopWidth: 2, borderLeftWidth: 2 },
  tr: { top: 6, right: 6, borderTopWidth: 2, borderRightWidth: 2 },
  bl: { bottom: 6, left: 6, borderBottomWidth: 2, borderLeftWidth: 2 },
  br: { bottom: 6, right: 6, borderBottomWidth: 2, borderRightWidth: 2 },

  /* Last Draw Balls */
  lastDrawBalls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  lastDrawPlus: {
    color: '#fcd34d',
    fontSize: scale(18),
    fontWeight: 'bold',
    marginHorizontal: 2,
  },

  /* Payout Table */
  payoutTable: {
    width: '100%',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
    paddingTop: 8,
  },
  payoutRow: {
    flexDirection: 'row',
    paddingVertical: 3,
  },
  payoutLabel: {
    fontSize: scale(11),
    color: 'rgba(252, 211, 77, 0.6)',
    fontWeight: 'bold',
  },
  payoutValue: {
    fontSize: scale(11),
    color: 'rgba(255, 255, 255, 0.85)',
  },

  /* Jackpot */
  jackpotLabel: {
    fontSize: scale(13),
    color: 'rgba(252, 211, 77, 0.8)',
    letterSpacing: 2,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  jackpotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jackpotIcon: {
    fontSize: scale(28),
    marginRight: 8,
  },
  jackpotValue: {
    fontSize: scale(32),
    fontWeight: 'bold',
    color: 'white',
  },
  goldSymbol: {
    color: '#fcd34d',
  },
  nextDrawInfoText: {
    fontSize: scale(12),
    color: 'rgba(252, 211, 77, 0.6)',
    marginTop: 6,
  },

  /* Section Label */
  sectionRow: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: scale(13),
    color: 'rgba(252, 211, 77, 0.8)',
    letterSpacing: 2,
    fontWeight: 'bold',
  },

  /* Lantern Area */
  lanternArea: {
    width: '95%',
    alignItems: 'center',
    minHeight: 90,
    justifyContent: 'center',
  },
  lanternGrid: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  placeholderBalls: {
    height: 80,
  },

  /* Star Button */
  starButton: {
    position: 'absolute',
    right: 0,
    padding: 4,
  },

  /* Fortune Text */
  fortuneText: {
    color: '#fcd34d',
    fontSize: scale(18),
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: scale(18),
  },
  timeText: {
    fontSize: scale(12),
    color: 'rgba(252, 211, 77, 0.5)',
    marginBottom: 16,
  },

  /* Generate Button */
  generateButton: {
    marginTop: scale(10),
    width: '90%',
    height: scale(54),
    borderRadius: scale(27),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  buttonInner: {
    flex: 1,
    backgroundColor: '#b91c1c',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fcd34d',
    fontSize: scale(20),
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  brushIcon: {
    marginRight: 10,
  },

  /* Mode Toggle */
  modeToggle: {
    flexDirection: 'row',
    marginBottom: scale(12),
    gap: 6,
    width: '90%',
    justifyContent: 'center',
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#d4af37',
  },
  modeTabText: {
    fontSize: scale(14),
    color: 'rgba(252, 211, 77, 0.5)',
    fontWeight: 'bold',
  },
  modeTabTextActive: {
    color: '#fcd34d',
  },

  /* Zodiac Selector */
  zodiacCard: {
    width: '90%',
    backgroundColor: 'rgba(69, 10, 10, 0.9)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    marginBottom: 14,
  },
  zodiacSectionLabel: {
    fontSize: scale(13),
    color: 'rgba(252, 211, 77, 0.8)',
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  zodiacGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  zodiacItem: {
    width: '14.5%',
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  zodiacItemActive: {
    borderColor: '#d4af37',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  zodiacEmoji: {
    fontSize: scale(24),
  },
  zodiacLabel: {
    fontSize: scale(10),
    color: 'rgba(252, 211, 77, 0.6)',
    marginTop: 2,
  },
  zodiacLabelActive: {
    color: '#fcd34d',
    fontWeight: 'bold',
  },

  /* Hour Selector */
  hourScroll: {
    paddingHorizontal: 4,
    gap: 8,
  },
  hourPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
  },
  hourPillActive: {
    borderColor: '#d4af37',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  hourPillText: {
    fontSize: scale(13),
    color: 'rgba(252, 211, 77, 0.6)',
    fontWeight: 'bold',
  },
  hourPillTextActive: {
    color: '#fcd34d',
  },
  hourPillTime: {
    fontSize: scale(10),
    color: 'rgba(252, 211, 77, 0.4)',
    marginTop: 2,
  },

  /* Banker Display */
  bankerDisplay: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  bankerGroup: {
    alignItems: 'center',
    width: '100%',
  },
  bankerGroupLabel: {
    fontSize: scale(13),
    color: '#d4af37',
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 6,
  },
  bankerBallRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  bankerDivider: {
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    marginVertical: 4,
  },
  bankerSectionDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    marginVertical: 10,
  },

  /* Color Filter Toggle */
  colorFilterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  colorFilterLabel: {
    fontSize: scale(13),
    color: 'rgba(252, 211, 77, 0.8)',
    fontWeight: 'bold',
  },
  colorFilterSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  colorFilterSwitchOn: {
    backgroundColor: 'rgba(212, 175, 55, 0.5)',
  },
  colorFilterKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  colorFilterKnobOn: {
    alignSelf: 'flex-end',
    backgroundColor: '#fcd34d',
  },

  /* Multiple Grid */
  multipleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
  },

  /* Fixed Bottom Nav */
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'android' ? 24 : 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.15)',
    backgroundColor: 'rgba(69, 10, 10, 0.95)',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navText: {
    fontSize: scale(11),
    color: 'rgba(252, 211, 77, 0.7)',
    marginTop: 4,
  },
});

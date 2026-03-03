import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Ball } from './Ball';
import { FrequencyChart } from './FrequencyChart';
import { DrawResult, AnalyseResponse } from '../types/lottery';
import { useTranslation } from '../i18n/LanguageContext';
import { getCache, setCache } from '../utils/cacheUtils';
import { apiFetch } from '../utils/apiClient';

interface AnalysisModalProps {
  visible: boolean;
  onClose: () => void;
}

const COUNT_OPTIONS = [10, 20, 30] as const;
type DrawCount = typeof COUNT_OPTIONS[number];

const formatDate = (dateStr: string): string => {
  return dateStr.split(/[T+]/)[0];
};

const DrawRow = React.memo(({ item }: { item: DrawResult }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <Text style={styles.drawNumber}>{t('drawPrefix', { n: item.drawNumber })}</Text>
        <Text style={styles.drawDate}>{formatDate(item.drawDate)}</Text>
      </View>
      <View style={styles.ballRow}>
        {item.numbers.map((num, i) => (
          <Ball key={`${num}-${i}`} number={Number(num)} size="small" />
        ))}
        <Text style={styles.plusSign}>+</Text>
        <Ball key={`extra-${item.extraNumber}`} number={Number(item.extraNumber)} size="small" />
      </View>
    </View>
  );
});

export const AnalysisModal: React.FC<AnalysisModalProps> = React.memo(
  ({ visible, onClose }) => {
    const { t } = useTranslation();
    const [draws, setDraws] = useState<DrawResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [count, setCount] = useState<DrawCount>(10);
    const [showChart, setShowChart] = useState(false);

    const fetchData = useCallback(async (n: DrawCount) => {
      const cacheKey = `analyse_${n}`;
      const cached = await getCache<DrawResult[]>(cacheKey);
      if (cached) {
        setDraws(cached);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const json = await apiFetch<AnalyseResponse>(`analyse?count=${n}`);
        if (json.success && json.data) {
          setDraws(json.data);
          setCache(cacheKey, json.data);
        } else {
          setError(json.error || t('fetchError'));
        }
      } catch {
        setError(t('networkError'));
      } finally {
        setLoading(false);
      }
    }, [t]);

    useEffect(() => {
      if (visible) fetchData(count);
    }, [visible, count, fetchData]);

    const handleCountChange = useCallback((n: DrawCount) => {
      setCount(n);
      setShowChart(false);
    }, []);

    const toggleChart = useCallback(() => {
      setShowChart((prev) => !prev);
    }, []);

    const renderContent = () => {
      if (loading) {
        return (
          <View style={styles.center}>
            <ActivityIndicator color="#fcd34d" size="large" />
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        );
      }
      if (error) {
        return (
          <View style={styles.center}>
            <Ionicons name="warning-outline" size={32} color="#fcd34d" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        );
      }
      if (draws.length === 0) {
        return (
          <View style={styles.center}>
            <Text style={styles.emptyText}>{t('noData')}</Text>
          </View>
        );
      }
      return (
        <FlatList
          data={draws}
          keyExtractor={(item) => item.drawNumber}
          renderItem={({ item }) => <DrawRow item={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      );
    };

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{t('analysisTitle')}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fcd34d" />
              </TouchableOpacity>
            </View>

            {/* Count Tabs */}
            <View style={styles.tabRow}>
              {COUNT_OPTIONS.map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.tab, count === n && styles.tabActive]}
                  onPress={() => handleCountChange(n)}
                >
                  <Text style={[styles.tabText, count === n && styles.tabTextActive]}>
                    {t('recentDraws', { n })}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Distribution Button */}
            <TouchableOpacity
              style={[styles.distributionButton, showChart && styles.distributionButtonActive]}
              onPress={toggleChart}
              disabled={loading || draws.length === 0}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="chart-bar"
                size={18}
                color={showChart ? '#450a0a' : '#fcd34d'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.distributionText, showChart && styles.distributionTextActive]}>
                {t('distribution')}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {showChart && draws.length > 0 ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.chartScrollContent}
                nestedScrollEnabled
              >
                <FrequencyChart draws={draws} />
              </ScrollView>
            ) : (
              renderContent()
            )}

            {/* 四角金邊 */}
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '92%',
    maxHeight: '85%',
    backgroundColor: '#450a0a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fcd34d',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#d4af37',
  },
  tabText: {
    color: 'rgba(252, 211, 77, 0.5)',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fcd34d',
  },
  chartScrollContent: {
    paddingBottom: 20,
  },
  distributionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    backgroundColor: 'transparent',
  },
  distributionButtonActive: {
    backgroundColor: '#fcd34d',
    borderColor: '#fcd34d',
  },
  distributionText: {
    color: '#fcd34d',
    fontSize: 14,
    fontWeight: '600',
  },
  distributionTextActive: {
    color: '#450a0a',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    marginVertical: 12,
  },
  list: {
    paddingBottom: 10,
  },
  center: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(252, 211, 77, 0.6)',
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    color: 'rgba(252, 211, 77, 0.7)',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  emptyText: {
    color: 'rgba(252, 211, 77, 0.5)',
    fontSize: 16,
    fontStyle: 'italic',
  },
  row: {
    backgroundColor: 'rgba(69, 10, 10, 0.8)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 12,
    marginBottom: 10,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  drawNumber: {
    color: '#fcd34d',
    fontSize: 14,
    fontWeight: 'bold',
  },
  drawDate: {
    color: 'rgba(252, 211, 77, 0.5)',
    fontSize: 12,
  },
  ballRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 6,
  },
  plusSign: {
    color: '#fcd34d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  corner: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderColor: '#d4af37',
  },
  tl: { top: 6, left: 6, borderTopWidth: 2, borderLeftWidth: 2 },
  tr: { top: 6, right: 6, borderTopWidth: 2, borderRightWidth: 2 },
  bl: { bottom: 6, left: 6, borderBottomWidth: 2, borderLeftWidth: 2 },
  br: { bottom: 6, right: 6, borderBottomWidth: 2, borderRightWidth: 2 },
});

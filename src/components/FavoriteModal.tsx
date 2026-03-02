import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ball } from './Ball';
import { FavoriteEntry } from '../types/lottery';
import { useTranslation } from '../i18n/LanguageContext';

interface FavoriteModalProps {
  visible: boolean;
  favorites: FavoriteEntry[];
  onClose: () => void;
  onRemove: (id: number) => void;
}

const formatTime = (date: Date): string => {
  const mo = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  return `${mo}-${d} ${h}:${m}:${s}`;
};

const BankerBallRow: React.FC<{ numbers: number[]; bankerCount: number }> = ({ numbers, bankerCount }) => {
  const { t } = useTranslation();
  const bankers = numbers.slice(0, bankerCount);
  const players = numbers.slice(bankerCount);
  return (
    <View style={styles.bankerLayout}>
      <View style={styles.bankerSection}>
        <Text style={styles.bankerLabel}>{t('banker')}</Text>
        <View style={styles.ballRow}>
          {bankers.map((num) => (
            <Ball key={`b-${num}`} number={num} size="small" />
          ))}
        </View>
      </View>
      <Text style={styles.bankerPlus}>+</Text>
      <View style={styles.bankerSection}>
        <Text style={styles.bankerLabel}>{t('player')}</Text>
        <View style={styles.ballRow}>
          {players.map((num) => (
            <Ball key={`p-${num}`} number={num} size="small" />
          ))}
        </View>
      </View>
    </View>
  );
};

const FavoriteRow = React.memo(
  ({ item, index, onRemove }: { item: FavoriteEntry; index: number; onRemove: (id: number) => void }) => (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <Text style={styles.rowIndex}>#{index + 1}</Text>
        <View style={styles.rowActions}>
          <Text style={styles.rowTime}>{formatTime(item.timestamp)}</Text>
          <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={16} color="rgba(252, 211, 77, 0.6)" />
          </TouchableOpacity>
        </View>
      </View>
      {item.bankerCount ? (
        <BankerBallRow numbers={item.numbers} bankerCount={item.bankerCount} />
      ) : (
        <View style={styles.ballRow}>
          {item.numbers.map((num) => (
            <Ball key={num} number={num} size="small" />
          ))}
        </View>
      )}
    </View>
  ),
);

export const FavoriteModal: React.FC<FavoriteModalProps> = React.memo(
  ({ visible, favorites, onClose, onRemove }) => {
    const { t } = useTranslation();
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
              <Text style={styles.title}>{t('favoriteTitle')}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fcd34d" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {favorites.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>{t('noFavorite')}</Text>
              </View>
            ) : (
              <FlatList
                data={favorites}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                  <FavoriteRow item={item} index={index} onRemove={onRemove} />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
              />
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
    maxHeight: '80%',
    backgroundColor: '#450a0a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    padding: 20,
    position: 'relative',
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
  divider: {
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    marginVertical: 12,
  },
  list: {
    paddingBottom: 10,
  },
  empty: {
    paddingVertical: 40,
    alignItems: 'center',
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
    alignItems: 'center',
    marginBottom: 8,
  },
  rowIndex: {
    color: '#fcd34d',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTime: {
    color: 'rgba(252, 211, 77, 0.5)',
    fontSize: 12,
    marginRight: 10,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  ballRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 6,
    paddingHorizontal: 4,
  },
  bankerLayout: {
    alignItems: 'center',
    gap: 4,
  },
  bankerSection: {
    alignItems: 'center',
  },
  bankerLabel: {
    fontSize: 11,
    color: '#d4af37',
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  bankerPlus: {
    color: '#fcd34d',
    fontSize: 14,
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

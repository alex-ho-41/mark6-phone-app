import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../i18n/LanguageContext';
import { Lang } from '../i18n/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onReset?: () => void;
}

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'zh', label: '繁體中文' },
  { value: 'en', label: 'English' },
];

const PRIVACY_POLICY_URL = 'https://ahohty41.github.io/mark6-phone-app/privacy-policy.html';

export const SettingsModal: React.FC<SettingsModalProps> = React.memo(
  ({ visible, onClose, onReset }) => {
    const { lang, setLang, t } = useTranslation();

    const handleReset = () => {
      Alert.alert(
        t('resetAppData'),
        t('confirmReset'),
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset',
            style: 'destructive',
            onPress: async () => {
              await AsyncStorage.clear();
              onReset?.();
              onClose();
            },
          },
        ],
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
              <Text style={styles.title}>{t('settings')}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fcd34d" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Language Section */}
            <Text style={styles.sectionLabel}>{t('language')}</Text>
            <View style={styles.optionsContainer}>
              {LANG_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionRow,
                    lang === option.value && styles.optionRowActive,
                  ]}
                  onPress={() => setLang(option.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      lang === option.value && styles.optionLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {lang === option.value && (
                    <Ionicons name="checkmark" size={20} color="#fcd34d" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider} />

            {/* About Section */}
            <Text style={styles.sectionLabel}>{t('about')}</Text>
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionLabel}>{t('privacyPolicy')}</Text>
              <Ionicons name="open-outline" size={18} color="rgba(252, 211, 77, 0.6)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionRow, { marginTop: 12, borderColor: '#ef4444' }]}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionLabel, { color: '#ef4444' }]}>{t('resetAppData')}</Text>
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>

            <View style={styles.versionRow}>
              <Text style={styles.versionText}>{t('version')} 1.0.0</Text>
            </View>

            {/* Gold corners */}
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
    width: '85%',
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
    marginVertical: 16,
  },
  sectionLabel: {
    color: 'rgba(252, 211, 77, 0.8)',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    backgroundColor: 'rgba(69, 10, 10, 0.8)',
  },
  optionRowActive: {
    borderColor: '#d4af37',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  optionLabel: {
    color: 'rgba(252, 211, 77, 0.6)',
    fontSize: 16,
    fontWeight: '600',
  },
  optionLabelActive: {
    color: '#fcd34d',
  },
  corner: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderColor: '#d4af37',
  },
  versionRow: {
    alignItems: 'center',
    marginTop: 16,
  },
  versionText: {
    color: 'rgba(252, 211, 77, 0.4)',
    fontSize: 12,
  },
  tl: { top: 6, left: 6, borderTopWidth: 2, borderLeftWidth: 2 },
  tr: { top: 6, right: 6, borderTopWidth: 2, borderRightWidth: 2 },
  bl: { bottom: 6, left: 6, borderBottomWidth: 2, borderLeftWidth: 2 },
  br: { bottom: 6, right: 6, borderBottomWidth: 2, borderRightWidth: 2 },
});

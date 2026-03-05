import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useTranslation } from '../i18n/LanguageContext';

interface DisclaimerModalProps {
  visible: boolean;
  onAccept: () => void;
}

const DISCLAIMER_ZH = [
  '1. 本應用程式（「本程式」）為獨立開發之非官方工具，僅供資訊及娛樂參考用途。',
  '2. 本程式與香港賽馬會（HKJC）或任何官方機構並無任何關聯，亦未獲其授權、認可或贊助。',
  '3. 本程式不提供任何博彩、投注、代購彩票或相關金融服務。',
  '4. 本程式所顯示之開彩結果、統計數據及相關資料，均源自公開渠道，不保證資料之即時性、準確性或完整性，請以香港賽馬會官方公布為準。',
  '5. 隨機號碼產生功能僅供娛樂，不構成任何投注建議，本程式對因參考本程式資料而產生之任何損失概不負責。',
  '6. 使用本程式即表示您確認您已年滿 18 歲，並了解本程式之非官方性質。',
  '7. 本程式保留隨時修改或終止服務之權利，恕不另行通知。',
];

const DISCLAIMER_EN = [
  '1. This application ("the App") is an independently developed, unofficial tool intended solely for informational and entertainment purposes.',
  '2. The App has no affiliation with, and is not authorized, endorsed, or sponsored by the Hong Kong Jockey Club (HKJC) or any official body.',
  '3. The App does not provide any gambling, betting, lottery purchasing, or related financial services.',
  '4. Draw results, statistical data, and related information displayed in the App are sourced from publicly available channels. No guarantee is made as to their timeliness, accuracy, or completeness. Please refer to official HKJC announcements for authoritative information.',
  '5. The random number generation feature is for entertainment only and does not constitute betting advice. The App accepts no liability for any losses arising from reliance on information provided herein.',
  '6. By using the App, you confirm that you are aged 18 or above and acknowledge the unofficial nature of this App.',
  '7. The App reserves the right to modify or discontinue the service at any time without prior notice.',
];

export const DisclaimerModal: React.FC<DisclaimerModalProps> = React.memo(
  ({ visible, onAccept }) => {
    const { t } = useTranslation();
    const [scrolledToBottom, setScrolledToBottom] = useState(false);
    const [scrollViewHeight, setScrollViewHeight] = useState(0);

    const handleScroll = useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (scrolledToBottom) return;
        const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
        // Increase buffer to 50 and use a more reliable check
        const isBottom =
          layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
        if (isBottom) setScrolledToBottom(true);
      },
      [scrolledToBottom],
    );

    const onContentSizeChange = useCallback(
      (width: number, height: number) => {
        // If content is small enough to fit without scrolling, or within buffer, enable button
        if (scrollViewHeight > 0 && height <= scrollViewHeight + 20) {
          setScrolledToBottom(true);
        }
      },
      [scrollViewHeight, scrolledToBottom],
    );

    const onScrollViewLayout = useCallback((e: any) => {
      const { height } = e.nativeEvent.layout;
      setScrollViewHeight(height);
    }, []);

    return (
      <Modal visible={visible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* Gold corners */}
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />

            {/* Header */}
            <Text style={styles.title}>{t('disclaimerTitle')}</Text>
            <View style={styles.divider} />

            {/* Scrollable content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              onScroll={handleScroll}
              onMomentumScrollEnd={handleScroll}
              onContentSizeChange={onContentSizeChange}
              onLayout={onScrollViewLayout}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator
            >
              <Text style={styles.sectionHeader}>免責聲明</Text>
              {DISCLAIMER_ZH.map((item, i) => (
                <Text key={`zh-${i}`} style={styles.bodyText}>
                  {item}
                </Text>
              ))}

              <View style={styles.sectionDivider} />

              <Text style={styles.sectionHeader}>Disclaimer</Text>
              {DISCLAIMER_EN.map((item, i) => (
                <Text key={`en-${i}`} style={styles.bodyText}>
                  {item}
                </Text>
              ))}
            </ScrollView>

            {/* Hint text */}
            {!scrolledToBottom && (
              <Text style={styles.hintText}>{t('scrollToAccept')}</Text>
            )}

            {/* Accept button */}
            <TouchableOpacity
              style={[
                styles.acceptButton,
                !scrolledToBottom && styles.acceptButtonDisabled,
              ]}
              onPress={onAccept}
              disabled={!scrolledToBottom}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.acceptText,
                  !scrolledToBottom && styles.acceptTextDisabled,
                ]}
              >
                {t('acceptContinue')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
    paddingBottom: 16,
    position: 'relative',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fcd34d',
    textAlign: 'center',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    marginVertical: 12,
  },
  scrollView: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fcd34d',
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 20,
    marginBottom: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    marginVertical: 16,
  },
  hintText: {
    fontSize: 12,
    color: 'rgba(252, 211, 77, 0.5)',
    textAlign: 'center',
    marginTop: 8,
  },
  acceptButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    backgroundColor: '#b91c1c',
    alignItems: 'center',
    width: '100%',
  },
  acceptButtonDisabled: {
    opacity: 0.4,
  },
  acceptText: {
    color: '#fcd34d',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  acceptTextDisabled: {
    opacity: 0.5,
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

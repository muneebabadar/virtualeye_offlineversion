import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, I18nManager, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';

import { AccessibleText } from '@/components/AccessibleText';
import { AccessibleButton } from '@/components/AccessibleButton';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useAccessibleColors } from '@/hooks/useAccessibleColors';

// Custom Accessible Collapsible Component
const HelpSection = ({ title, children, icon }: { title: string; children: React.ReactNode; icon: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { hapticFeedback, speak } = useAccessibility();
  const colors = useAccessibleColors();
  const { t } = useTranslation();

  const toggleSection = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    hapticFeedback?.('light');
    
    // Announce state change to screen reader
    const announcement = newState 
      ? t('common.expanded', { title }) 
      : t('common.collapsed', { title });
    speak?.(announcement, true);
  };

  return (
    <View style={[styles.sectionContainer, { borderColor: colors.border }]}>
      <AccessibleButton
        onPress={toggleSection}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={`${title}. ${isOpen ? t('common.collapseHint') : t('common.expandHint')}`}
        style={[
          styles.sectionHeader, 
          { 
            backgroundColor: colors.card,
            flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' 
          }
        ]}
      >
        <Feather name={icon as any} size={24} color={colors.primary} />
        <AccessibleText style={[styles.sectionTitle, { color: colors.text }]} level={3}>
          {title}
        </AccessibleText>
        <Feather 
          name={isOpen ? 'chevron-up' : 'chevron-down'} 
          size={24} 
          color={colors.textLight} 
        />
      </AccessibleButton>
      
      {isOpen && (
        <View style={[styles.sectionContent, { backgroundColor: colors.background }]}>
          {children}
        </View>
      )}
    </View>
  );
};

export default function ExploreScreen() {
  const { t } = useTranslation();
  const colors = useAccessibleColors();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <AccessibleText 
          style={{ color: colors.textInverse, fontSize: 28, fontWeight: '800' }} 
          level={1}
        >
          {t('welcome.featuresTitle')}
        </AccessibleText>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AccessibleText style={[styles.introText, { color: colors.text }]}>
          {t('personReview.description')}
        </AccessibleText>

        <HelpSection title={t('welcome.object')} icon="box">
          <AccessibleText style={styles.detailText}>{t('welcome.objectDesc')}</AccessibleText>
          <AccessibleText style={styles.detailText}>{t('personCapture.instructions')}</AccessibleText>
        </HelpSection>

        <HelpSection title={t('welcome.person')} icon="users">
          <AccessibleText style={styles.detailText}>{t('welcome.personDesc')}</AccessibleText>
          <AccessibleText style={styles.detailText}>{t('personRegistration.registerHint')}</AccessibleText>
        </HelpSection>

        <HelpSection title={t('welcome.color')} icon="eye">
          <AccessibleText style={styles.detailText}>{t('welcome.colorDesc')}</AccessibleText>
        </HelpSection>

        <HelpSection title={t('welcome.currency')} icon="dollar-sign">
          <AccessibleText style={styles.detailText}>{t('welcome.currencyDesc')}</AccessibleText>
        </HelpSection>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  scrollContent: {
    padding: 20,
  },
  introText: {
    fontSize: 18,
    marginBottom: 24,
    lineHeight: 26,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  sectionHeader: {
    minHeight: 64, // Optimal Android touch target
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 12,
  },
  sectionContent: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  footerSpacer: {
    height: 40,
  }
});
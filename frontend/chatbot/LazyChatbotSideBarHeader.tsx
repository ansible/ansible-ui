import React, { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const ChatbotTitle = lazy(() => import('./ChatbotSideBarHeader'));

export const LazyChatbotSideBarHeader = () => {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<span>{t('Loading...')}</span>}>
      <ChatbotTitle />
    </Suspense>
  );
};

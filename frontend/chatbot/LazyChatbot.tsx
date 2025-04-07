import React, { lazy, Suspense } from 'react';

const ChatbotPortal = lazy(() => import('./ChatbotPortal'));

export const LazyChatbot = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatbotPortal />
    </Suspense>
  );
};

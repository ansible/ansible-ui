import { useTranslation } from 'react-i18next';

/** Help text for the show_leaderboard setting, shared by the settings details and edit pages. */
export function useAutomationLeaderboardHelpText() {
  const { t } = useTranslation();
  return t(
    'Controls whether the Automation Leaderboard is visible to all users with access to Automation Analytics.'
  );
}

import { useTranslation } from 'react-i18next';

/** Help text for the show_leaderboard setting, shared by the settings details and edit pages. */
export function useAutomationLeaderboardHelpText() {
  const { t } = useTranslation();
  return t(
    'Flag to control enable/disable of Automation Leaderboard within Automation Analytics Tab. If enabled, the Leaderboard will be visible to all user types. If disabled, it will not be visible to all user types.'
  );
}

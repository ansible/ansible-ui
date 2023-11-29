import { QuickStart } from '@patternfly/quickstarts';
import { useTranslation } from 'react-i18next';

export function useFindingContentQuickStart() {
  const { t } = useTranslation();
  const quickStart: QuickStart = {
    metadata: {
      name: t('finding-content'),
      instructional: true,
    },
    spec: {
      displayName: t('Finding content in automation hub'),
      durationMinutes: 2,
      icon: '',
      type: { text: t('Automation Hub'), color: 'grey' },
      prerequisites: [t('You have a valid Ansible Automation Platform subscription.')],
      description: t('Learn to search for and browse automation hub content.'),
      introduction: t(
        'In this Quick Start you will learn to search for and browse automation hub content.'
      ),
      tasks: [
        {
          title: t('Search for automation hub content'),
          description: t(
            '## To search for automation hub content:\n1. From the navigation panel, select **Collections > Collections**.\n2. In the drop down menu next to the search field, select the filter that you want to use.\n    - **Repository**: filter by content type (rh-certified, validated, community, or published)\n    - **Namespace**: filter by provider or company\n    - **Tag**: filter by topic\n    - **Keyword**: search using a relevant keyword\n3. Scroll through the list of search results and select the collection you want.'
          ),
          review: {
            instructions: t(
              'Do you see a list of collection titles that correspond to your search filter or term?'
            ),
          },
        },
      ],
      conclusion: t('You has successfully searched for and browseed automation hub content.'),
    },
  };
  return quickStart;
}

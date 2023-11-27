import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PlatformQuickStart } from './PlatformQuickStart';

export function useFindingContent(): PlatformQuickStart {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      id: 'finding-content',
      name: t('Finding automation content'),
      subtitle: t('Automation Hub'),
      description: t('Learn how to search for and browse automation hub content.'),
      durationMinutes: 10,
      prerequisites: [t('You have a valid Ansible Automation Platform subscription.')],
      introduction: t(
        'In this Quick Start you will learn to search for and browse automation hub content.'
      ),
      tasks: [
        {
          title: t('Search for automation hub content'),
          description: t('To search for automation hub content:'),
          actions: [
            t('From the navigation panel, select **Collections > Collections**'),
            t(
              'In the Filter by keywords field, enter an appropriate keyword for the collection you want to search for and click the magnifying glass icon.'
            ),
            t(
              'If you don’t find what you’re looking for, you can expand your search. From the dropdown menu, select **Repository**, **Namespace**, or **Tag** depending on the search term you want to use.'
            ),
            t('Scroll through the list of search results and select the collection you want.'),
          ],
          review: {
            question: t(
              'Do you see a list of collection titles that correspond to your search term?'
            ),
          },
        },
        {
          title: t('Browse automation hub content'),
          description: t('To browse automation hub content:'),
          actions: [
            t('From the navigation panel, select **Collections > Collections**'),
            t(
              'Scroll through the list of collections and use the page navigation arrows to go to the next page'
            ),
            t(
              'To see more collections on a single page, select the number of collections you want to see per page from the drop down menu beneath the collection count.'
            ),
            t('Choose your page layout by selecting **Tile** or **List** view.'),
          ],
          review: {
            question: t('Do you see a list of collection titles that you can scroll through?'),
          },
        },
      ],
      conclusion: t('You have browsed automation hub content!'),
    }),
    [t]
  );
}

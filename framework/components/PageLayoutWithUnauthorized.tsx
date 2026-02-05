import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageHeaderProps } from '../PageHeader';
import { PageLayout } from '../PageLayout';
import { EmptyStateUnauthorized } from './EmptyStateUnauthorized';

export interface PageLayoutWithUnauthorizedProps extends PageHeaderProps {
  /**
   * Whether to show the unauthorized state.
   * Typically determined by checking for a 403 error from an API call.
   */
  isUnauthorized: boolean;

  /**
   * The name of the resource being accessed (e.g., "Remotes", "Collections").
   * Used to generate the unauthorized title: "You do not have access to {resourceName}"
   */
  resourceName: string;

  /**
   * Custom unauthorized title. If not provided, uses the default:
   * "You do not have access to {resourceName}"
   */
  unauthorizedTitle?: string;

  /**
   * Custom admin message for the unauthorized state. If not provided, uses the default:
   * "Contact your organization administrator for more information."
   */
  unauthorizedAdminMessage?: string;

  /**
   * The content to render when the user is authorized.
   */
  children: ReactNode;
}

/**
 * A wrapper component that handles the common pattern of showing an unauthorized state
 * when a user doesn't have access to a resource.
 *
 * This component eliminates the need to duplicate PageHeader props between the
 * unauthorized and authorized states.
 *
 * @example
 * ```tsx
 * const isUnauthorized = isAccessDeniedError(view.error);
 *
 * return (
 *   <PageLayoutWithUnauthorized
 *     isUnauthorized={isUnauthorized}
 *     resourceName="Remotes"
 *     title={t('Remotes')}
 *     description={t('Remotes are external sources...')}
 *     titleHelpTitle={t('Remotes')}
 *     titleHelp={t('Remotes are external sources...')}
 *     titleDocLink={docsUrl}
 *   >
 *     <PageTable ... />
 *   </PageLayoutWithUnauthorized>
 * );
 * ```
 */
export function PageLayoutWithUnauthorized(props: PageLayoutWithUnauthorizedProps) {
  const { t } = useTranslation();

  const {
    isUnauthorized,
    resourceName,
    unauthorizedTitle,
    unauthorizedAdminMessage,
    children,
    // PageHeader props
    navigation,
    breadcrumbs,
    title,
    titleHelpTitle,
    titleHelp,
    titleDocLink,
    description,
    controls,
    headerActions,
    footer,
  } = props;

  const pageHeaderProps: PageHeaderProps = {
    navigation,
    breadcrumbs,
    title,
    titleHelpTitle,
    titleHelp,
    titleDocLink,
    description,
    controls,
    headerActions,
    footer,
  };

  const defaultUnauthorizedTitle = t('You do not have access to {{resourceName}}', {
    resourceName,
  });
  const defaultAdminMessage = t('Contact your organization administrator for more information.');

  return (
    <PageLayout>
      <PageHeader {...pageHeaderProps} />
      {isUnauthorized ? (
        <EmptyStateUnauthorized
          title={unauthorizedTitle ?? defaultUnauthorizedTitle}
          adminMessage={unauthorizedAdminMessage ?? defaultAdminMessage}
        />
      ) : (
        children
      )}
    </PageLayout>
  );
}

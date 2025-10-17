import { IPageNotification } from '@ansible/ansible-ui-framework/PageNotifications/PageNotification';
import { usePageNotifications } from '@ansible/ansible-ui-framework/PageNotifications/usePageNotifications';
import { useGet } from '@ansible/common-ui/crud/useGet';
import DOMPurify from 'dompurify';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { parseStringPromise } from 'xml2js';
import { usePlatformActiveUser } from '../main/PlatformActiveUserProvider';
import { gatewayAPI } from '../utils/gateway-api-utils';

function extractDescription(content: unknown): string | undefined {
  switch (typeof content) {
    case 'string':
      return content;
    case 'object':
      if (Array.isArray(content)) return undefined;
      return (content as { _?: string })?._;
    default:
      return undefined;
  }
}

function extractLink(link: unknown): string | undefined {
  switch (typeof link) {
    case 'string':
      return link;
    case 'object':
      if (Array.isArray(link)) {
        const alternateLink = link.find((l: unknown) => {
          const linkObj = l as { $?: { rel?: string; href?: string } };
          return linkObj?.$?.rel === 'alternate';
        }) as { $?: { rel?: string; href?: string } } | undefined;
        return alternateLink?.$?.href;
      } else if (link && typeof (link as { $?: unknown })?.$ === 'object') {
        return (link as { $: { href?: string } }).$?.href;
      }
      return undefined;
    default:
      return undefined;
  }
}

function createSanitizedDescription(description?: string): React.ReactElement {
  const sanitizeConfig = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'style'],
  };

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(description || '', sanitizeConfig),
      }}
    />
  );
}

function isValidForDeploymentType(
  aapNotification: Record<string, unknown>,
  deploymentType?: string
): boolean {
  const notificationDeploymentType = aapNotification['aap:deployment_type'];

  if (typeof notificationDeploymentType === 'string') {
    return notificationDeploymentType === deploymentType;
  }

  if (
    deploymentType &&
    Array.isArray(notificationDeploymentType) &&
    notificationDeploymentType.length > 0 &&
    notificationDeploymentType.every((item) => typeof item === 'string')
  ) {
    return notificationDeploymentType.includes(deploymentType);
  }

  return true;
}

function isNotificationPublished(aapNotification: Record<string, unknown>): boolean {
  const unpublish = aapNotification['aap:unpublish'];
  if (typeof unpublish === 'string') {
    return new Date(unpublish) >= new Date();
  }
  return true;
}

function processRssEntry(entry: XmlNode, deploymentType?: string): IPageNotification | null {
  if (
    typeof entry.id !== 'string' ||
    typeof entry.title !== 'string' ||
    typeof entry.updated !== 'string'
  ) {
    return null;
  }

  const aapNotification = entry['aap:notification'];
  if (typeof aapNotification !== 'object' || Array.isArray(aapNotification) || !aapNotification) {
    return null;
  }

  if (!isValidForDeploymentType(aapNotification as Record<string, unknown>, deploymentType)) {
    return null;
  }

  if (!isNotificationPublished(aapNotification as Record<string, unknown>)) {
    return null;
  }

  const id = entry.id;
  let title = entry.title;
  let description = extractDescription(entry.content);
  const link = extractLink(entry.link);
  let timestamp = entry.updated;

  const aapNotificationObj = aapNotification as Record<string, unknown>;

  if (typeof aapNotificationObj['aap:title'] === 'string') {
    title = aapNotificationObj['aap:title'];
  }

  if (typeof aapNotificationObj['aap:description'] === 'string') {
    description = aapNotificationObj['aap:description'];
  }

  if (typeof aapNotificationObj['aap:publish'] === 'string') {
    timestamp = aapNotificationObj['aap:publish'];
  }

  return {
    id,
    title,
    description: createSanitizedDescription(description),
    to: link,
    timestamp,
    variant: 'info',
    newTab: true,
  };
}

export function useRssNotifications() {
  const { activePlatformUser } = usePlatformActiveUser();

  // Only fetch settings if user is a superuser to avoid 403 errors
  const { data: gatewaySettings, error: settingsError } = useGet<{
    AAP_DEPLOYMENT_TYPE: string;
    NOTIFICATION_RSS_FEED_URL: string;
    NOTIFICATION_RSS_FEED_ENABLED: boolean;
  }>(activePlatformUser?.is_superuser ? gatewayAPI`/settings/all/` : undefined, undefined, {
    refreshInterval: 5 * 60 * 1000,
  });

  const { data: feedContent } = useSWR<string>(
    gatewaySettings?.NOTIFICATION_RSS_FEED_ENABLED && gatewaySettings?.NOTIFICATION_RSS_FEED_URL,
    {
      fetcher: (url: string) => fetch(url).then((res) => res.text()),
      refreshInterval: 10 * 60 * 1000, // Refresh every 10 minutes
      revalidateOnFocus: false, // Do not revalidate on focus
    }
  );

  const { t } = useTranslation();
  const title = t('Product Notifications');

  const { setNotificationGroups } = usePageNotifications();

  useEffect(() => {
    async function parseRssFeed(feedContent: string, deploymentType?: string) {
      try {
        const { feed } = (await parseStringPromise(feedContent, {
          trim: true,
          explicitArray: false,
        })) as { feed: XmlNode };

        if (!feed.entry || (!Array.isArray(feed.entry) && typeof feed.entry !== 'object')) {
          return;
        }

        const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry];
        const notifications: IPageNotification[] = [];

        for (const entry of entries) {
          const notification = processRssEntry(entry as XmlNode, deploymentType);
          if (notification) {
            notifications.push(notification);
          }
        }

        if (!notifications.length) return;

        setNotificationGroups((groups) => {
          return {
            ...groups,
            [title]: { title, notifications },
          };
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error parsing RSS feed:', error);
      }
    }
    if (feedContent) {
      void parseRssFeed(feedContent, gatewaySettings?.AAP_DEPLOYMENT_TYPE);
    }
  }, [feedContent, gatewaySettings?.AAP_DEPLOYMENT_TYPE, setNotificationGroups, title]);

  useEffect(() => {
    if (gatewaySettings?.NOTIFICATION_RSS_FEED_ENABLED === false) {
      setNotificationGroups((groups) => {
        const filteredGroups = { ...groups };
        delete filteredGroups[title];
        return filteredGroups;
      });
    }
  }, [gatewaySettings?.NOTIFICATION_RSS_FEED_ENABLED, setNotificationGroups, title]);

  useEffect(() => {
    if (settingsError) {
      setNotificationGroups((groups) => {
        const filteredGroups = { ...groups };
        delete filteredGroups[title];
        return filteredGroups;
      });
    }
  }, [settingsError, setNotificationGroups, title]);
}

export interface XmlNode {
  // Attributes are typically stored under a property named '$' by default.
  // The value of attributes is a dictionary where keys are attribute names and values are strings.
  $: { [key: string]: string } | undefined;

  // Text content within an element is often stored under a property named '_' by default.
  // With `trim: true`, leading/trailing whitespace will be removed.
  // It is a string or undefined if no text content.
  _: string | undefined;

  // For child elements, xml2js creates properties with the child element's tag name.
  // With `explicitArray: false`:
  // - If there's a single child element, its value will be a single XmlNode object.
  // - If there are multiple child elements, its value will be an array of XmlNode objects.
  // Also includes `string | undefined` for cases where a child element might directly contain
  // only text without attributes or further nesting (though `_` is more common for this).
  [key: string]: XmlNode | XmlNode[] | string | { [key: string]: string } | undefined;
}

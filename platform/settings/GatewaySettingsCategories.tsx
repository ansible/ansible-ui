import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GatewaySettingsOption } from './GatewaySettingOptions';

export function useGatewaySettingsCategories(options: Record<string, GatewaySettingsOption>) {
  const { t } = useTranslation();
  return useMemo(() => {
    const categories: {
      id: string;
      title: string;
      description: string;
      sections: {
        title: string;
        include?: string[];
        exclude?: string[];
        options: Record<string, GatewaySettingsOption>;
      }[];
    }[] = [
      {
        id: 'gateway',
        title: t('Gateway settings'),
        description: t(''),
        sections: [
          {
            title: t('Gateway'),
            include: ['gateway_proxy_url', 'gateway_proxy_url_ignore_cert'],
            options: {},
          },
          {
            title: t('Security'),
            include: [
              'allow_admins_to_set_insecure',
              'gateway_basic_auth_enabled',
              'SOCIAL_AUTH_USERNAME_IS_FULL_EMAIL',
              'gateway_token_name',
              'gateway_access_token_expiration',
              'jwt_private_key',
              'jwt_public_key',
            ],
            options: {},
          },
          {
            title: t('Session'),
            include: ['SESSION_COOKIE_AGE'],
            options: {},
          },
          {
            title: t('Password Security'),
            include: [
              'password_min_upper',
              'password_min_length',
              'password_min_digits',
              'password_min_special',
            ],
            options: {},
          },
          {
            title: t('Custom Login'),
            include: ['custom_login_info', 'custom_logo'],
            options: {},
          },
        ],
      },
    ];

    // Add other settings that are not included in the existing categories
    categories[0].sections.push({
      title: t('Other settings'),
      exclude: [
        'LOGIN_REDIRECT_OVERRIDE',
        'DEFAULT_PAGE_SIZE',
        'MAX_PAGE_SIZE',
        ...categories.reduce<string[]>(
          (acc, category) =>
            acc.concat(
              category.sections.reduce<string[]>(
                (acc, section) => acc.concat(section.include || []),
                []
              )
            ),
          []
        ),
      ],
      options: {},
    });

    // Add the options to the categories
    for (const [key, value] of Object.entries(options)) {
      const category = categories.find((category) =>
        category.sections.some((section) => section.include?.includes(key))
      );
      if (category) {
        const section = category.sections.find((section) => section.include?.includes(key));
        if (section) {
          section.options[key] = value;
        }
      } else {
        const otherCategory = categories.find((category) =>
          category.sections.some((section) => !section.include)
        );
        const otherSection = otherCategory?.sections.find((section) => !section.include);
        if (otherSection) {
          if (otherSection.exclude?.includes(key)) continue;
          otherSection.options[key] = value;
        }
      }
    }

    // Remove empty sections
    categories.forEach((category) => {
      category.sections = category.sections.filter(
        (section) => Object.keys(section.options).length > 0
      );
    });

    // Sort the sections by the order they are defined in the category
    categories.forEach((category) => {
      category.sections.sort((a, b) => {
        const aIndex = category.sections.findIndex((section) => section === a);
        const bIndex = category.sections.findIndex((section) => section === b);
        return aIndex - bIndex;
      });
    });

    // Sort the section options by the order they are defined in the options include array
    categories.forEach((category) => {
      category.sections.forEach((section) => {
        if (!section.include) return;
        section.options = Object.fromEntries(
          Object.entries(section.options).sort((a, b) => {
            const aIndex = section.include?.indexOf(a[0]) ?? -1;
            const bIndex = section.include?.indexOf(b[0]) ?? -1;
            return aIndex - bIndex;
          })
        );
      });
    });

    return categories;
  }, [options, t]);
}

import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
} from '@ansible/ansible-ui-framework';
import { ButtonVariant, Label, LabelGroup } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { GatewaySettingsOption } from './GatewaySettingOptions';
import { useGatewaySettingsCategories } from './GatewaySettingsCategories';

export function GatewaySettingsDetails(props: { categoryId: string }) {
  const { t } = useTranslation();
  const { settings, options, hasWritePermissions } = useOutletContext<{
    options: {
      GET: Record<string, GatewaySettingsOption>;
      PUT: Record<string, GatewaySettingsOption>;
    };
    settings: Record<string, unknown>;
    hasWritePermissions: boolean;
  }>();
  const navigate = useNavigate();
  const actions = useMemo<IPageAction<object>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        icon: PencilAltIcon,
        label: t('Edit platform gateway settings'),
        onClick: () => void navigate('./edit'),
        isPinned: true,
        isHidden: () => !hasWritePermissions,
      },
    ],
    [navigate, t, hasWritePermissions]
  );
  const categories = useGatewaySettingsCategories(options.GET);
  const category = categories.find((category) => category.id === props.categoryId);
  if (!category) {
    return null;
  }

  return (
    <PageLayout>
      <PageHeader
        title={category.title}
        description={category.description}
        headerActions={<PageActions actions={actions} position={'right'} />}
      />
      <PageDetails>
        {category.sections.map((section) => (
          <Fragment key={section.title}>
            {Object.keys(section.options).map((key) => {
              const option = options.GET[key];
              const value = settings[key];
              if (key === 'custom_logo' && value && value !== '') {
                return (
                  <PageDetail key={key} label={option.label} helpText={option.help_text}>
                    <img src={value as string} alt={t('Custom logo')} style={{ height: 32 }} />
                  </PageDetail>
                );
              } else {
                switch (typeof value) {
                  case 'string':
                    return (
                      <PageDetail key={key} label={option.label} helpText={option.help_text}>
                        {value}
                      </PageDetail>
                    );
                  case 'number':
                    return (
                      <PageDetail key={key} label={option.label} helpText={option.help_text}>
                        {value}
                      </PageDetail>
                    );
                  case 'boolean':
                    return (
                      <PageDetail key={key} label={option.label} helpText={option.help_text}>
                        {value ? t('Enabled') : t('Disabled')}
                      </PageDetail>
                    );
                  case 'object':
                    return value && Array.isArray(value) ? (
                      <PageDetail key={key} label={option.label} helpText={option.help_text}>
                        <LabelGroup>
                          {value.map((url) => (
                            <Label key={url as string}>{url}</Label>
                          ))}
                        </LabelGroup>
                      </PageDetail>
                    ) : null;
                  default:
                    return null;
                }
              }
            })}
          </Fragment>
        ))}
      </PageDetails>
    </PageLayout>
  );
}

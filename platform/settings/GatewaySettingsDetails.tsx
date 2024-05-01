import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PencilAltIcon } from '@patternfly/react-icons';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
} from '../../framework';
import { GatewaySettingsOption } from './GatewaySettingOptions';
import { useGatewaySettingsCategories } from './GatewaySettingsCategories';

export function GatewaySettingsDetails(props: { categoryId: string }) {
  const { t } = useTranslation();
  const { settings, options } = useOutletContext<{
    options: Record<string, GatewaySettingsOption>;
    settings: Record<string, unknown>;
  }>();
  const navigate = useNavigate();
  const actions = useMemo<IPageAction<object>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        icon: PencilAltIcon,
        label: t('Edit'),
        onClick: () => navigate('./edit', { replace: true }),
        isPinned: true,
      },
    ],
    [navigate, t]
  );

  const categories = useGatewaySettingsCategories(options);
  const category = categories.find((category) => category.id === props.categoryId);
  if (!category) {
    return null;
  }

  return (
    <PageLayout>
      <PageHeader
        title={category.title}
        description={category.description}
        headerActions={<PageActions actions={actions} position={DropdownPosition.right} />}
      />
      <PageDetails>
        {category.sections.map((section) => (
          <Fragment key={section.title}>
            {Object.keys(section.options).map((key) => {
              const option = options[key];
              const value = settings[key];
              switch (typeof value) {
                case 'string':
                  return (
                    <PageDetail key={key} label={option.label}>
                      {value}
                    </PageDetail>
                  );
                case 'number':
                  return (
                    <PageDetail key={key} label={option.label}>
                      {value}
                    </PageDetail>
                  );
                case 'boolean':
                  return (
                    <PageDetail key={key} label={option.label}>
                      {value ? t('Enabled') : t('Disabled')}
                    </PageDetail>
                  );
                default:
                  return null;
              }
            })}
          </Fragment>
        ))}
      </PageDetails>
    </PageLayout>
  );
}

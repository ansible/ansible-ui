import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PencilAltIcon } from '@patternfly/react-icons';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../PageActions/PageAction';
import { PageActions } from '../PageActions/PageActions';
import { PageDetail } from '../PageDetails/PageDetail';
import { PageDetails } from '../PageDetails/PageDetails';
import { PageHeader } from '../PageHeader';
import { PageLayout } from '../PageLayout';
import { PageSettingsContext } from './PageSettingsProvider';
import { IPageSettingsOption, usePageSettingsOptions } from './usePageSettingOptions';

export function PageSettingsDetails() {
  const { t } = useTranslation();
  const [settings] = useContext(PageSettingsContext);
  const navigate = useNavigate();
  const actions = useMemo<IPageAction<object>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        icon: PencilAltIcon,
        label: t('Edit'),
        onClick: () => navigate('./edit'),
        isPinned: true,
      },
    ],
    [navigate, t]
  );
  const options = usePageSettingsOptions();

  return (
    <PageLayout>
      <PageHeader
        title={t('User Preferences')}
        headerActions={<PageActions actions={actions} position={DropdownPosition.right} />}
      />
      <PageDetails>
        {options.map((option) => (
          <PageSettingsDetail
            key={option.name}
            option={option}
            value={(settings as Record<string, string | number>)[option.name]}
          />
        ))}
      </PageDetails>
    </PageLayout>
  );
}

function PageSettingsDetail(props: { option: IPageSettingsOption; value: string | number }) {
  const optionLabel = props.option.options.find((option) => option.value === props.value)?.label;
  return (
    <PageDetail
      label={props.option.label}
      helpText={props.option.helpText}
      id={props.option.name.toLowerCase()}
    >
      {optionLabel}
    </PageDetail>
  );
}

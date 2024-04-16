import { useTranslation } from 'react-i18next';
import { LoadingPage, PageFormSelect } from '../../../../../framework';
import { useOptions } from '../../../../common/crud/useOptions';
import { edaAPI } from '../../../common/eda-utils';

interface ContentTypeOption {
  value: string;
  display_name: string;
}

export function EdaSelectResourceTypeStep() {
  const { t } = useTranslation();
  const { data, isLoading } = useOptions<{
    actions: { POST: { content_type: { choices: ContentTypeOption[] } } };
  }>(edaAPI`/role_definitions/`);

  if (isLoading || !data) {
    return <LoadingPage />;
  }

  const options: ContentTypeOption[] = data?.actions?.POST?.content_type?.choices || [];

  return (
    <PageFormSelect
      label={t('Resource type')}
      name="resourceType"
      options={options
        .filter((option) => option.value.startsWith('eda.'))
        .map(({ value, display_name }) => ({
          value,
          label: display_name,
        }))}
    />
  );
}

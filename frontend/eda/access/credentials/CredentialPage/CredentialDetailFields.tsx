import { PageDetail } from '../../../../../framework';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { useTranslation } from 'react-i18next';
import { capitalizeFirstLetter } from '../../../../../framework/utils/strings';

export function CredentialDetailFields(props: { credential: EdaCredential }) {
  const { t } = useTranslation();
  if (!props?.credential?.inputs) return <></>;
  const enabledOptions: string[] = [];
  Object.keys(props?.credential?.inputs).map((label, idx) => {
    if (
      typeof Object.values(props?.credential?.inputs || {}).at(idx) === 'boolean' &&
      Object.values(props?.credential?.inputs || {}).at(idx) === true
    ) {
      enabledOptions.push(capitalizeFirstLetter(label));
    }
  });

  return (
    <>
      {Object.keys(props?.credential?.inputs).map((label, idx) => {
        return typeof Object.values(props?.credential?.inputs || {}).at(idx) !== 'boolean' ? (
          <PageDetail key={label} label={capitalizeFirstLetter(label)}>
            {Object.values(props?.credential?.inputs || {}).at(idx) as string}
          </PageDetail>
        ) : (
          <></>
        );
      })}
      {enabledOptions.length > 0 && (
        <PageDetail key={'enabled_options'} label={t('Enabled options')}>
          {enabledOptions.join(', ')}
        </PageDetail>
      )}
    </>
  );
}

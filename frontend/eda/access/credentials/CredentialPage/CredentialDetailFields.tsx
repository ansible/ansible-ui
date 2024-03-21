import { LoadingPage, PageDetail } from '../../../../../framework';
import { useGet } from '../../../../common/crud/useGet';
import { edaAPI } from '../../../common/eda-utils';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { EdaCredentialType } from '../../../interfaces/EdaCredentialType';

export function CredentialDetailFields(props: { credential: EdaCredential }) {
  const { data: credentialType } = useGet<EdaCredentialType>(
    edaAPI`/credential-types/` + `${props.credential.credential_type?.id ?? ''}/`
  );

  if (!credentialType) {
    return <LoadingPage />;
  }
  return (
    <>
      {props?.credential?.inputs &&
        Object.keys(props?.credential?.inputs).map((value, idx) => {
          return (
            <PageDetail key={value} label={value}>
              {Object.values(props?.credential?.inputs || {}).at(idx) as string}
            </PageDetail>
          );
        })}
    </>
  );
}

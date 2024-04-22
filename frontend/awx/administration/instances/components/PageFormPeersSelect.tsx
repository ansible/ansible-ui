import { TFunction } from 'i18next';
import { ReactNode } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormMultiInput } from '../../../../../framework/PageForm/Inputs/PageFormMultiInput';
import { Instance } from '../../../interfaces/Instance';
import { useMultiSelectPeer } from '../hooks/useSelectPeers';

export function PageFormPeersSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  labelHelp: string;
  additionalControls?: ReactNode;
  isRequired?: boolean;
}) {
  const multiSelectelectPeer = useMultiSelectPeer();
  const { t } = useTranslation();
  return (
    <PageFormMultiInput<Instance>
      {...props}
      name={props.name}
      id="peer-select"
      placeholder={t('Select peer')}
      label={t('Peers')}
      selectTitle={t('Select peers')}
      selectOpen={multiSelectelectPeer}
      validate={(value: Instance[]) => validatePeer(value, t)}
      isRequired={props.isRequired}
    />
  );
}

function validatePeer(peer: Instance[], t: TFunction<'translation', undefined>) {
  const arrAux: string[] = [];

  if (peer?.length > 1) {
    peer.map((element) => {
      if (element.listener_port) {
        return undefined;
      } else {
        arrAux.push(element.hostname);
      }
    });
    if (arrAux?.length >= 1) {
      return t('Field listener_port must be set on peers {{peersInstance}}', {
        peersInstance: arrAux.toString(),
      });
    }
  } else if (peer?.length === 1) {
    if (peer[0].listener_port) {
      return undefined;
    } else {
      return t('Field listener_port must be set on peer {{peerInstance}}.', {
        peerInstance: peer[0].hostname,
      });
    }
  } else {
    return undefined;
  }
}

import { Slider, SliderOnChangeEvent } from '@patternfly/react-core';
import { t } from 'i18next';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { Instance } from '../../../interfaces/Instance';
import { useInstanceActions } from '../hooks/useInstanceActions';
import { awxAPI } from '../../../common/api/awx-utils';
import { Settings } from '../../../interfaces/Settings';
import { useGet } from '../../../../common/crud/useGet';

export function InstanceForksSlider(props: { instance: Instance }) {
  const { instance } = props;
  const { instanceForks, handleInstanceForksSlider } = useInstanceActions(String(instance.id));
  const capacityAvailable = instance.cpu_capacity !== 0 && instance.mem_capacity !== 0;
  const { activeAwxUser } = useAwxActiveUser();
  const { data } = useGet<Settings>(awxAPI`/settings/system/`);
  const isK8s = data?.IS_K8S;

  return (
    <>
      <div data-cy="number-forks">{t(`${instanceForks} forks`)}</div>
      <Slider
        areCustomStepsContinuous
        max={instance.mem_capacity}
        min={instance.cpu_capacity}
        value={instanceForks}
        onChange={(_event: SliderOnChangeEvent, value: number) =>
          void handleInstanceForksSlider(instance, value)
        }
        isDisabled={
          !(
            (activeAwxUser?.is_superuser || activeAwxUser?.is_system_auditor) &&
            isK8s &&
            instance.enabled &&
            capacityAvailable
          )
        }
      />
    </>
  );
}

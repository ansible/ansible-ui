import { Slider, SliderOnChangeEvent, Tooltip } from '@patternfly/react-core';
import { t } from 'i18next';
import { Dotted } from '../../../../../framework/components/Dotted';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { Instance } from '../../../interfaces/Instance';
import { useInstanceActions } from '../hooks/useInstanceActions';

export function InstanceForksSlider(props: { instance: Instance }) {
  const { instance } = props;
  const { instanceForks, handleInstanceForksSlider } = useInstanceActions(String(instance.id));
  const capacityAvailable = instance.cpu_capacity !== 0 && instance.mem_capacity !== 0;
  const { activeAwxUser } = useAwxActiveUser();

  if (instanceForks > 0) {
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
          isDisabled={!activeAwxUser?.is_superuser || !instance.enabled || !capacityAvailable}
        />
      </>
    );
  } else {
    return instance.node_type === 'hop' ? (
      <Tooltip isContentLeftAligned={true} content={t('Cannot adjust capacity for hop nodes.')}>
        <Dotted>{t('Unavailable')}</Dotted>
      </Tooltip>
    ) : (
      <Tooltip isContentLeftAligned={true} content={t('0 forks. Cannot adjust capacity.')}>
        <Dotted>{t('Unavailable')}</Dotted>
      </Tooltip>
    );
  }
}

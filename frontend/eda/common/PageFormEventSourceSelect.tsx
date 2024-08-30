import { FieldPath, FieldValues } from 'react-hook-form';
import { EdaRulebook } from '../interfaces/EdaRulebook';
import { EdaSourceEventMapping } from '../interfaces/EdaSource';
import { PageFormGroup } from '../../../framework/PageForm/Inputs/PageFormGroup';
import { Button, Chip, ChipGroup, InputGroup, TextInput, Tooltip } from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';
import { useFrameworkTranslations } from '../../../framework';
import { useID } from '../../../framework/hooks/useID';
import styled from 'styled-components';
import { useSelectEventStreams } from '../event-streams/hooks/useSelectEventStreams';
import { useTranslation } from 'react-i18next';

interface ChipHolderProps {
  readonly $isDisabled: boolean;
}
const ChipHolder = styled.div<ChipHolderProps>`
  --pf-v5-c-form-control--Height: auto;
  background-color: ${(props) =>
    props.$isDisabled ? 'var(--pf-v5-global--disabled-color--300)' : null};
`;

export function PageFormEventSourceSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  label: string;
  labelHelp: string;
  labelHelpTitle: string;
  isRequired?: boolean;
  rulebook: EdaRulebook;
  sourceMappings: EdaSourceEventMapping[];
  setSourceMappings: (sourceMappings: EdaSourceEventMapping[]) => void;
  placeholder?: string;
  selectTitle?: string;
  isDisabled?: boolean;
}) {
  const { selectTitle, label, placeholder, labelHelp, labelHelpTitle } = props;
  const { isDisabled } = props;
  const [translations] = useFrameworkTranslations();
  const { t } = useTranslation();
  const value: EdaSourceEventMapping[] = props?.sourceMappings;
  const id = useID(props);
  const removeMapping = (event_stream_name: string) => {
    if (value) {
      const map = value.filter((ev) => ev.event_stream_name !== event_stream_name);
      props.setSourceMappings(map);
      if (value.length === 0) props.setSourceMappings([]);
    }
  };
  const selectEventStreams = useSelectEventStreams(
    props?.rulebook,
    props?.sourceMappings,
    props?.setSourceMappings
  );
  return (
    <PageFormGroup
      label={label}
      labelHelp={labelHelp}
      labelHelpTitle={labelHelpTitle}
      fieldId={id}
      data-cy={'event-stream-form-group'}
    >
      <InputGroup data-cy={'event-stream-input-group'}>
        {value?.length ? (
          <ChipHolder $isDisabled={isDisabled ?? false} className="pf-v5-c-form-control">
            <ChipGroup
              numChips={5}
              expandedText={translations.showLess}
              collapsedText={translations.countMore.replace('{count}', `${value?.length - 5}`)}
            >
              {value?.map((item) => (
                <Tooltip
                  key={item.event_stream_id}
                  content={`${item?.event_stream_name} ${t(' was swapped with ')} ${item?.source_name}`}
                >
                  <Chip
                    key={item.event_stream_id}
                    data-cy={`event-chip-${item?.event_stream_id}`}
                    onClick={() => removeMapping(item?.event_stream_name)}
                  >
                    {item.event_stream_name}
                  </Chip>
                </Tooltip>
              ))}
            </ChipGroup>
          </ChipHolder>
        ) : (
          <TextInput aria-label={placeholder} isDisabled placeholder={placeholder} />
        )}
        {selectTitle && (
          <Button
            variant="control"
            onClick={selectEventStreams}
            aria-label="Options menu"
            isDisabled={isDisabled}
            data-cy={`select-event-stream-button`}
          >
            <CogIcon />
          </Button>
        )}
      </InputGroup>
    </PageFormGroup>
  );
}

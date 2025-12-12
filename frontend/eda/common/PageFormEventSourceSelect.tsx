import { useFrameworkTranslations } from '@ansible/ansible-ui-framework';
import { useID } from '@ansible/ansible-ui-framework/hooks/useID';
import { PageFormGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormGroup';
import { Label, LabelGroup, Button, InputGroup, TextInput, Tooltip } from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';
import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useSelectEventStreams } from '../event-streams/hooks/useSelectEventStreams';
import { EdaSourceEventMapping } from '../interfaces/EdaSource';

interface ChipHolderProps {
  readonly $isDisabled: boolean;
}
const ChipHolder = styled.div<ChipHolderProps>`
  --pf-v6-c-form-control--Height: auto;
  align-items: center;
  padding-inline-start: 4px;
  background-color: ${(props) =>
    props.$isDisabled ? 'var(--pf-t--global--background--color--disabled--default)' : null};
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
  rulebookId: string;
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
  const {
    control,
    formState: { isValidating },
  } = useFormContext<TFieldValues>();
  const removeMapping = (event_stream_name: string) => {
    if (value) {
      const map = value.filter((ev) => ev.event_stream_name !== event_stream_name);
      props.setSourceMappings(map);
      if (value.length === 0) props.setSourceMappings([]);
    }
  };
  const selectEventStreams = useSelectEventStreams(
    props?.rulebookId,
    props?.sourceMappings,
    props?.setSourceMappings
  );
  return (
    <Controller<TFieldValues, TFieldName>
      name={props?.name}
      control={control}
      shouldUnregister
      render={({ fieldState: { error } }) => {
        return (
          <PageFormGroup
            label={label}
            labelHelp={labelHelp}
            labelHelpTitle={labelHelpTitle}
            fieldId={id}
            data-cy={'event-stream-form-group'}
            data-testid={'event-stream-form-group'}
            helperTextInvalid={!isValidating && error?.message}
          >
            <InputGroup data-cy={'event-stream-input-group'}>
              {value?.length ? (
                <ChipHolder $isDisabled={isDisabled ?? false} className="pf-v6-c-form-control">
                  <LabelGroup
                    numLabels={5}
                    expandedText={translations.showLess}
                    collapsedText={translations.countMore.replace(
                      '{count}',
                      `${value?.length - 5}`
                    )}
                  >
                    {value?.map((item) => (
                      <Tooltip
                        key={item.event_stream_id}
                        content={`${item?.event_stream_name} ${t(' was swapped with ')} ${item?.source_name}`}
                      >
                        <Label
                          variant="outline"
                          key={item.event_stream_id}
                          data-cy={`event-chip-${item?.event_stream_id}`}
                          data-testid={`event-chip-${item?.event_stream_id}`}
                          onClose={() => removeMapping(item?.event_stream_name)}
                        >
                          {item.event_stream_name}
                        </Label>
                      </Tooltip>
                    ))}
                  </LabelGroup>
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
                  data-testid={`select-event-stream-button`}
                >
                  <CogIcon />
                </Button>
              )}
            </InputGroup>
          </PageFormGroup>
        );
      }}
    />
  );
}

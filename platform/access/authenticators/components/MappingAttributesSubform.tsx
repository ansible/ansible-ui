import { PageFormSelect, PageFormTextInput } from '@ansible/ansible-ui-framework';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { Button } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MappingFieldsGrid } from './MappingFields';

export function MappingAttributesSubform() {
  const { control } = useFormContext();
  const {
    fields: attributes,
    append,
    remove: deleteAttribute,
  } = useFieldArray({
    control,
    name: `attributes`,
  });

  const addAttribute = useCallback(() => {
    append({
      attribute: '',
      comparison: 'contains',
      value: '',
    });
  }, [append]);

  useEffect(() => {
    if (!attributes.length) {
      addAttribute();
    }
  }, [attributes.length, addAttribute]);

  return attributes.map((attribute, index) => (
    <AttributeFields
      key={attribute.id}
      index={index}
      addAttribute={index + 1 === attributes.length ? addAttribute : undefined}
      deleteAttribute={attributes.length > 1 ? () => deleteAttribute(index) : undefined}
    />
  ));
}

interface AttributeFieldsProps {
  index: number;
  addAttribute?: () => void;
  deleteAttribute?: () => void;
}
export function AttributeFields(props: Readonly<AttributeFieldsProps>) {
  const { index, deleteAttribute, addAttribute } = props;
  const { t } = useTranslation();
  return (
    <PageFormSection singleColumn>
      <MappingFieldsGrid>
        <PageFormTextInput
          id={`attributes-${index}-attribute`}
          name={`attributes.${index}.attribute`}
          label={t('Attribute')}
          isRequired
          placeholder={t('Enter attribute')}
        />
        <PageFormSelect
          id={`attributes-${index}-comparison`}
          name={`attributes.${index}.comparison`}
          label={t('Comparison')}
          placeholderText={t('Select comparison')}
          options={[
            { value: 'contains', label: t('contains') },
            { value: 'matches', label: t('matches') },
            { value: 'ends_with', label: t('ends with') },
            { value: 'equals', label: t('equals') },
            { value: 'in', label: t('in') },
          ]}
          isRequired
        />
        <PageFormTextInput
          id={`attributes-${index}-value`}
          name={`attributes.${index}.value`}
          label={t('Value')}
          placeholder={t('Enter value')}
          isRequired
        />
        {deleteAttribute ? (
          <Button
            icon={<TrashIcon />}
            aria-label={t('Delete attribute')}
            onClick={deleteAttribute}
            style={{ gridColumn: 4 }}
            variant="plain"
          />
        ) : null}
        {addAttribute ? (
          <Button
            icon={<PlusCircleIcon />}
            aria-label={t('Add attribute')}
            onClick={addAttribute}
            style={{ gridColumn: 5 }}
            variant="plain"
          />
        ) : null}
      </MappingFieldsGrid>
    </PageFormSection>
  );
}

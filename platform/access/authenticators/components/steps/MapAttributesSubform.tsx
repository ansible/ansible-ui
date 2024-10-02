import { useEffect, useCallback } from 'react';
import { Button } from '@patternfly/react-core';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSelect, PageFormTextInput } from '../../../../../framework';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { MapFieldsGrid } from './MapFields';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';

export function MapAttributesSubform(props: Readonly<{ mappingIndex: number }>) {
  const { mappingIndex } = props;
  const { control } = useFormContext();
  const {
    fields: attributes,
    append,
    remove: deleteAttribute,
  } = useFieldArray({
    control,
    name: `mappings.${mappingIndex}.attributes`,
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
      mapIndex={mappingIndex}
      index={index}
      addAttribute={index + 1 === attributes.length ? addAttribute : undefined}
      deleteAttribute={attributes.length > 1 ? () => deleteAttribute(index) : undefined}
    />
  ));
}

interface AttributeFieldsProps {
  mapIndex: number;
  index: number;
  addAttribute?: () => void;
  deleteAttribute?: () => void;
}
export function AttributeFields(props: Readonly<AttributeFieldsProps>) {
  const { mapIndex, index, deleteAttribute, addAttribute } = props;
  const { t } = useTranslation();
  return (
    <PageFormSection singleColumn>
      <MapFieldsGrid>
        <PageFormTextInput
          id={`mappings-${mapIndex}-attributes-${index}-attribute`}
          name={`mappings.${mapIndex}.attributes.${index}.attribute`}
          label={t('Attribute')}
          isRequired
          placeholder={t('Enter attribute')}
        />
        <PageFormSelect
          id={`mappings-${mapIndex}-attributes-${index}-comparison`}
          name={`mappings.${mapIndex}.attributes.${index}.comparison`}
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
          id={`mappings-${mapIndex}-attributes-${index}-value`}
          name={`mappings.${mapIndex}.attributes.${index}.value`}
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
      </MapFieldsGrid>
    </PageFormSection>
  );
}

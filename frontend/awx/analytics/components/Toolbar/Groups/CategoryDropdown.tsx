import { ToolbarItem } from '@patternfly/react-core';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core/deprecated';
import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  categoryKey: string;
  selected: string;
  setSelected: (value: string) => void;
  categories: {
    key: string;
    name: string;
  }[];
}

export const CategoryDropdown: FunctionComponent<Props> = ({
  categoryKey,
  selected,
  setSelected = () => null,
  categories = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();
  return (
    <ToolbarItem data-cy={categoryKey}>
      <Select
        isOpen={isExpanded}
        variant={SelectVariant.single}
        aria-label={'Categories'}
        onToggle={() => setIsExpanded(!isExpanded)}
        onSelect={(_, selection) => {
          setSelected(selection as string);
          setIsExpanded(false);
        }}
        selections={selected}
        placeholderText={t('Filter by')}
      >
        {categories.map(({ key, name }) => (
          <SelectOption key={key} value={key}>
            {name}
          </SelectOption>
        ))}
      </Select>
    </ToolbarItem>
  );
};

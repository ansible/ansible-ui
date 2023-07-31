import {
  Button,
  MenuToggle,
  MenuToggleElement,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { Select, SelectOption, SelectList } from '@patternfly/react-core/next';
import { TimesIcon } from '@patternfly/react-icons';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageSelectOption, getPageSelectOptions } from './PageSelectOption';
import styled from 'styled-components';

const Placedholder = styled.span`
  color: var(--pf-global--Color--200);
`;

/** Single select typeahead for the page framework. */
export function PageSingleSelectTypeAhead<ValueT>(props: {
  /** The ID of the select. */
  id?: string;

  /** The icon to show in the select. */
  icon?: ReactNode;

  /** The placeholder to show when no value is selected. */
  placeholder: string;

  /** The selected value. */
  value: ValueT;

  /** The function to set the selected value. */
  onSelect: (value: ValueT) => void;

  /** The options to select from. */
  options: PageSelectOption<ValueT>[];
}) {
  const { t } = useTranslation();
  const { value, onSelect, placeholder } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [selected, setSelected] = useState<string>('');
  const options = getPageSelectOptions<ValueT>(props.options);
  const [selectOptions, setSelectOptions] = useState(() => options);

  const selectedOption = useMemo(
    () => options.find((option) => value === option.value),
    [options, value]
  );

  useEffect(() => {
    let newSelectOptions = options;

    if (filterValue) {
      newSelectOptions = options.filter((menuItem) =>
        menuItem.label.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    setSelectOptions(newSelectOptions);
  }, [filterValue]);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const Toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      id={props.id}
      isExpanded={isOpen}
      onClick={onToggleClick}
      ref={toggleRef}
      variant="typeahead"
      style={{ width: '100%', minWidth: 100 }}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={onToggleClick}
          onChange={onTextInputChange}
          id="typeahead-select-input"
          autoComplete="off"
          placeholder={placeholder}
        />
        <TextInputGroupUtilities>
          {!!inputValue && (
            <Button
              variant="plain"
              onClick={() => {
                setSelected('');
                setInputValue('');
                setFilterValue('');
              }}
              aria-label={t('Clear input value')}
            >
              <TimesIcon aria-hidden />
            </Button>
          )}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
    setFilterValue(value);
  };

  const handleOnSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined
  ) => {
    const newSelectedOption = options.find((option) => option.label === value);

    if (newSelectedOption) {
      onSelect(newSelectedOption.value);
      setIsOpen(false);
    }

    if (value) {
      setInputValue(value as string);
      setFilterValue(value as string);
      setSelected(value as string);
    }
  };

  return (
    <Select
      id="typeahead-select"
      isOpen={isOpen}
      selected={selected || selectedOption?.label}
      onSelect={handleOnSelect}
      onOpenChange={() => {
        setIsOpen(false);
        setFilterValue('');
      }}
      toggle={Toggle}
    >
      <SelectList id="typeadhead-select-list">
        {selectOptions.map((option) => (
          <SelectOption
            description={option.description}
            isDisabled={option.isDisabled}
            itemId={option.label}
            key={option.label}
            onClick={() => setSelected(option.label)}
          >
            {option.label}
          </SelectOption>
        ))}
        {!selectOptions.length && inputValue ? (
          <Placedholder id="no-result-found-typeahead" key={'not-found-typeahed'}>
            {t('No results found')}
          </Placedholder>
        ) : null}
      </SelectList>
    </Select>
  );
}

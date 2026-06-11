import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Content,
} from '@patternfly/react-core';

type KeyValue = {
  key: string;
  value: string;
};

type KeyValueProps = {
  keyValue: KeyValue[];
  title: string;
  keyColumn: string;
  valueColumn: string;
  renderValue?: (item: KeyValue) => JSX.Element;
};

export function PageDetailKeyValueList(props: KeyValueProps) {
  const { keyValue, title, keyColumn, valueColumn, renderValue } = props;

  const defaultRenderValue = (item: KeyValue) => (
    <div data-cy={`item-value`} data-testid={`item-value`}>
      {item.value}
    </div>
  );

  const renderFunction = renderValue || defaultRenderValue;

  return (
    <>
      <DescriptionListGroup>
        <Content>
          <Content
            component="p"
            data-cy={'key-value-list-title'}
            data-testid={'key-value-list-title'}
            style={{ fontSize: 'medium-text', fontWeight: 'bold' }}
          >
            {title}
          </Content>
        </Content>
        <DescriptionList isHorizontal>
          <DescriptionListGroup>
            <DescriptionListTerm>{keyColumn}</DescriptionListTerm>
            <DescriptionListTerm>{valueColumn}</DescriptionListTerm>
          </DescriptionListGroup>
          {keyValue.map((item, index) => (
            <DescriptionListGroup key={index}>
              <DescriptionListTerm
                style={{ fontWeight: 'normal', whiteSpace: 'pre-wrap', overflow: 'hidden' }}
                data-cy={`item-key-${index}`}
                data-testid={`item-key-${index}`}
              >
                {item.key}
              </DescriptionListTerm>
              <DescriptionListDescription
                style={{ fontWeight: 'normal', whiteSpace: 'pre-wrap', overflow: 'hidden' }}
              >
                {renderFunction(item)}
              </DescriptionListDescription>
            </DescriptionListGroup>
          ))}
        </DescriptionList>
      </DescriptionListGroup>
    </>
  );
}

This page covers three different kinds of empty state components. The descriptors below will indicate which one is appropriate for your use case. NOTE: All error messages should be translated, if possible.

The [EmptyStateError](https://github.com/ansible/ansible-ui/blob/main/framework/components/EmptyStateError.tsx) is used for server/network errors on a list view, notably, in PageTable.tsx. It has two optional props for a title and a message about the error.

```tsx
<ErrorStateDiv>
    <EmptyStateError titleProp="Something went wrong" message="502 Bad Gateway Error" />
</ErrorStateDiv>
```

| Prop           | Type           | Description                                 |
| -------------- | -------------- | ------------------------------------------- |
| titleProp?     | `string`       | The title of the error page.                |
| message?       | `string`       | The message indication the network error..  |


The [EmptyStateNoData](https://github.com/ansible/ansible-ui/blob/main/framework/components/EmptyStateNoData.tsx) is the second empty state component used when the connection to the server is good but no data for that view exists in the database.

```tsx
<PageSection>
    <EmptyStateNoData
        title={props.emptyStateTitle}
        description={props.emptyStateDescription}
        button={
        (props.emptyStateButtonClick && (
            <Button
            variant="primary"
            onClick={props.emptyStateButtonClick}
            icon={props.emptyStateButtonIcon ? props.emptyStateButtonIcon : null}
            >
            {props.emptyStateButtonText}
            </Button>
        ))
        }
        variant={EmptyStateVariant.large}
    />
</PageSection>
```

| Prop           | Type            | Description                                      |
| -------------- | --------------  | ------------------------------------------------ |
| title          | `string`        | The title of the empty state page.               |
| description    | `React.Node`    | The description of the empty state page.         |
| button?        | `ReactElement`  | A button for adding data or refreshing the page. |
| variant        | `xs, xl, small, large, full, undefined`| The size of the EmptyState component.            |


The [EmptyStateCustom](https://github.com/ansible/ansible-ui/blob/main/framework/components/EmptyStateCustom.tsx) is the component from which EmptyStateNoData derives and can be used as a more basic component when the two described above are not suitable.

```tsx
    <EmptyStateCustom
      icon={PlusCircleIcon}
      title={title}
      description={description}
      button={button}
      variant={variant}
      style={{ paddingTop: '48px' }}
    />
```

| Prop           | Type                  | Description                                      |
| -------------- | --------------        | ------------------------------------------------ |
| title          | `string`              | The title of the empty state page.               |
| description    | `React.Node`          | The description of the empty state page.         |
| button?        | `ReactElement`        | A button for adding data or refreshing the page. |
| variant?       | `xs, xl, small, large, full, undefined`         |                                                  |
| icon?          | `ComponentClass`      | The icon for the empty state page.               |
| footNote?      | `string`              | A footnote for the empty state page.             |
| image?         | `ReactElement`        | An image on the empty state page.                |
| footNote?      | `string`              | A footnote for the empty state page.             |
| style?         | `React.CSSProperties` | Any styling around the empty state page.         |

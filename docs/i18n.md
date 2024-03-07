# Getting started

AAP-UI leverages internationalization through the [react-i18next](https://react.i18next.com/) library. This library provides an easy way to handle translations, including pluralization.

## Using plural and singular

To handle both plural and singular forms, pass the `count` prop to the `t` function from `react-i18next`. Depending on the value of `count`, the corresponding singular or plural translation will be returned.

First, ensure you import the `useTranslation` hook:

```tsx
const count = 1;
const { t } = useTranslation();
t('singular', { count });
```

This will return the singular translation for the key `singular`. If the `count` is greater than 1, the plural translation will be returned, those are defined in the `locales` folder. In general, strings will have the following format

```json
  "Delete template": "Delete template",
  "Delete template_one": "Delete template",
  "Delete template_other": "Delete template",
```

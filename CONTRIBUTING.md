# Welcome to the contributing guide

Thank you for investing your time in contributing to our project!

To get an overview of the project, read the [README](README.md).

## Issues

If you find a problem with the project, search if an issue already exists. If a related issue doesn't exist, you can open a new issue.

## Code changes

If you have forked the project and created a branch with changes you would like to see added to the project, create a pull request and your request will be reviewed.

## Text and Internationalization

## Internationalization

Internationalization leans on the [i18next](https://www.i18next.com/) library. We use this library to mark our strings for translation.

### Marking strings for translation and replacement in the UI

The i18next library provides various React helpers for dealing with both marking strings for translation, and replacing strings that have been translated. For consistency and ease of use, we have consolidated on one pattern for the codebase. To set strings to be translated in the UI:

- import the `useTranslation` react hook from the `react-i18next`.
- wrap your string using the following format: `t('String to be translated')`

**Note:** If you have a variable string with text that needs translating, you must wrap it in ``t(`${variable} string`)`` where it is defined.

**Note:** Pluralization can be complicated so it is best to allow i18next handle cases where we have a string that may need to be pluralized based on number of items, or count. In that case i18next we will still use the `useTranslation` hook from above, but this time we will pass in a count variable. For example `t('Count of item to be translation', {count})`.

**Node:**
If an element does not have a string to be rendered on the screen then `aria-label` with string marked for translation should be included.

### Text Casing

For information about text casing (ie. when to use sentence casing and when to use other casing types) see our [CAPITALIZATION](docs/CAPITALIZATION.md) documentation

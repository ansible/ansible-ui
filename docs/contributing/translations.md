# Contributing translations

This guide is for translators, localization teams, customers, partners, and other contributors who want to improve Ansible UI translations. You do not need to understand the React codebase to update an existing translation.

## What can be translated

Locale catalogs are stored in [`locales/`](../../locales/). Each language uses the `translation` namespace:

```text
locales/<locale>/translation.json
```

[`locales/en/translation.json`](../../locales/en/translation.json) is the English reference catalog. Translation keys are generally English UI strings. Keep keys unchanged when translating values.

Plural forms are separate catalog entries. Preserve their suffixes, such as `_one` and `_other`, and keep interpolation placeholders such as `{{count}}` unchanged. Product names, acronyms, URLs, markup, and technical terms may intentionally remain unchanged.

The configured locale list is maintained in [`i18next-parser.config.cjs`](../../i18next-parser.config.cjs). It currently includes `en`, `es`, `fr`, `ja`, `ko`, `nl`, `zh`, and `zu`. Check the configuration rather than relying on this list in the guide, because supported locales can change.

## Before starting

You need:

- a GitHub account;
- fluency in the target language and familiarity with its product terminology; and
- a fork and branch if you are submitting a pull request.

Search existing [issues](https://github.com/ansible/ansible-ui/issues) and pull requests before starting a large translation effort, particularly when proposing a new language or changing established terminology.

## Update an existing language

1. Choose a locale already present under [`locales/`](../../locales/).
2. Compare its `translation.json` with [`locales/en/translation.json`](../../locales/en/translation.json).
3. Translate missing or incorrect **values**. Do not translate, rename, or remove keys.
4. Preserve JSON syntax, placeholders, plural suffixes, punctuation, and required markup.
5. Keep the existing four-space formatting and sorted catalog structure.
6. Use a focused branch and commit containing only the translation change.
7. Open a [pull request](https://github.com/ansible/ansible-ui/compare) and identify the locale, areas changed, and any terminology decisions that need reviewer input.

For example, the key stays the same while its value changes:

```diff
-    "Create template": "Create template",
+    "Create template": "Crear plantilla",
```

Do not run catalog generation and commit unrelated generated changes unless the pull request intentionally updates source strings and you have reviewed every resulting catalog change.

## Find missing or outdated strings

A key that exists in the English catalog but is absent from a target catalog may need to be added. A value that is still equal to English may also need translation, especially after a new feature or release. However, equal values are not automatically errors: product names, acronyms, technical terms, and intentionally shared text can remain in English.

The source code and parser configuration are authoritative when catalog contents appear inconsistent. The existing generator command is developer tooling, not a required first step for a translation-only contribution:

```bash
npm run i18n
```

This command scans `frontend/**/*.tsx` and `framework/**/*.tsx` according to [`i18next-parser.config.cjs`](../../i18next-parser.config.cjs) and can update catalogs. Run it only when you understand and review all resulting changes. Do not regenerate catalogs merely to find translation work.

## Validate your change

Before opening a pull request:

- parse the edited file as valid JSON;
- confirm it remains at `locales/<locale>/translation.json`;
- review the diff for accidental key changes, deleted entries, altered placeholders, and malformed plural entries;
- check the changed flow in the UI when possible; and
- check at least one pluralized or interpolated string when your change includes one, confirming that no raw interpolation token is displayed and text is not truncated.

For developer and release validation, see [Internationalization and translations](../dev/translations.md). Release owners use that document's pre-release manual check strategy to verify that new UI strings are marked for translation. That responsibility does not require every translator to inspect the source code.

## Pull request expectations

Reviewers look for:

- natural language and consistent product terminology;
- coherent changes rather than isolated machine-translated fragments;
- preserved placeholders, plural forms, punctuation, and target-language capitalization;
- no unrelated source, formatting, or generated-file changes; and
- JSON or UI validation evidence where relevant.

If machine translation was used, disclose it and have a fluent human review the result before submission. A merged partial catalog does not mean the language is fully supported; do not describe a language as complete unless its coverage and maintenance are agreed with project maintainers.

If you find a source-string problem, missing context, unclear terminology, or a catalog/tooling defect, raise an issue rather than guessing silently.

## Propose a new language

Adding a directory alone does not register or ship a locale. Before creating a new catalog:

1. [Open an issue](https://github.com/ansible/ansible-ui/issues/new/choose) describing the locale, language or region code, contributor or review team, expected coverage, and maintenance commitment.
2. Confirm the locale code and fallback behavior with maintainers.
3. Wait for approval before adding a directory or changing parser and runtime configuration.
4. After approval, register the locale consistently in the parser and relevant runtime/build configuration, then add the catalog and validation evidence in a focused pull request.
5. Agree with maintainers on what support means for the language, including ongoing ownership, terminology, and a plan to avoid presenting a mostly-English UI as complete.

## More information and help

- [Project contribution guide](../../CONTRIBUTING.md)
- [Developer internationalization documentation](../dev/translations.md)
- [Current locale catalogs](../../locales/)
- [Ansible UI issues](https://github.com/ansible/ansible-ui/issues)

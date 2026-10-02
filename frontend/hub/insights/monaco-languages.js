// Slim monaco-editor entry: core API + only the languages Hub needs.
// Replaces editor.main.js (which imports all 80+ languages) to keep
// the webpack build fast and avoid Module Federation TDZ issues.
export * from 'monaco-editor/esm/vs/editor/editor.api.js';

import 'monaco-editor/esm/vs/languages/definitions/yaml/register.js';
import 'monaco-editor/esm/vs/languages/definitions/markdown/register.js';
import 'monaco-editor/esm/vs/language/json/monaco.contribution.js';

# Stolostron / React Item View [![GitHub package.json version](https://img.shields.io/github/package-json/v/stolostron/react-data-view)](https://www.npmjs.com/package/@stolostron/react-data-view)

A react component for viewing items as a table or catalog card view.

[DEMO](https://stolostron.github.io/react-data-view/)

## Installation

```
npm i @stolostron/react-data-view
```

## Goals

### PatternFly

- Use PatternFly guidelines
- Support small screens using PatternFly responsive designs
  - Toolbar collapsing
  - Filters collapsing
- Use shadows as a visual indication that one surface has slid behind another surface
  - Work with PatternFly to adopt shadows

### Table

- Support table only view (no catalog)
- Support horizontal scrolling with sticky headers and columns
- Support column management
  - Support custom columns based on data labels
  - Persist column configuration to local storage
  - Save multiple column configurations and switch between
- Virtualized table rendering (performance)

### Catalog

- Support catalog only view (no table)
- Virtualized catalog rendering (performance)
- Card click supporting details drawer or navigation

### Search & Filter

- Filtering, Searching, Sorting of 100,000 items (performance)
- Fuzzy search (Fuse.js)
  - Search on fields with weights
- Persist search and filters to url query string
  - Allows saving a URL with preselected search & filters
  - Allow reload of page without losing filter & search

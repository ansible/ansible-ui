# Cypress Custom Commands

| Command                   | Description                                                              |
| ------------------------- | ------------------------------------------------------------------------ |
| getBy                     | Just like cy.get but makes sure the element is enabled and visible.      |
| containsBy                | Just like cy.contains but makes sure the element is enabled and visible. |
|                           |                                                                          |
| singleSelectBy            | Select an option from a single selection dropdown.                       |
| multiSelectBy             | Select option(s) from a multi-selection dropdown.                        |
|                           |                                                                          |
| setTableView              | Set the active view type for the table. (table, list, cards)             |
| selectTableFilter         | Select the active filter for the table.                                  |
| filterTableByTextFilter   | Filter the table by a text filter.                                       |
| filterTableBySingleSelect | Filter the table by a single selection filter.                           |
| filterTableByMultiSelect  | Filter the table by a multi-selection filter.                            |
| getTableRow               | Gets a table row by column that contains the value.                      |
| getTableCell              | Get a table cell by column that contains the value.                      |
| clickTableRowLink         | Click the link in the column that contains a value.                      |
| clickKebabAction          | Clicks an action that is in a kebeb menu.                                |
| clickTableRowAction       | Click an action for a specific table row.                                |
| selectTableRowByCheckbox  | Select the table row by checking the row checkbox.                       |
|                           |                                                                          |
| getModal                  | Get the active visible modal.                                            |
|                           |                                                                          |
| hasDetail                 | Verifies that a details page has a value for a key.                      |

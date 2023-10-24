/* eslint-disable i18next/no-literal-string */
import { Button } from '@patternfly/react-core';
import { useState } from 'react';
import { BulkActionDialog, useBulkActionDialog } from './BulkActionDialog';

interface Item {
  id: number;
  name: string;
}

describe('BulkActionDialog', () => {
  it('renders the dialog', () => {
    const props = {
      title: 'Delete Items',
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ],
      keyFn: ((item: Item) => item.id) as (item: object) => string | number,
      actionColumns: [
        {
          header: 'Name',
          cell: ((item: Item) => item.name) as (item: object) => React.ReactNode,
        },
      ],
      actionFn: cy.stub().resolves(),
      processingText: 'Deleting...',
      isDanger: true,
    };

    cy.mount(<BulkActionDialog {...props} />);

    cy.get('div').contains(props.title).should('be.visible');
    cy.get('div').contains(props.processingText).should('be.visible');
  });
});

describe('useBulkActionDialog', () => {
  it('opens the dialog on button click', () => {
    function TestComponent() {
      const openBulkActionDialog = useBulkActionDialog();
      const [isDialogOpen, setDialogOpen] = useState(false);

      const props = {
        title: 'Delete Items',
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        keyFn: ((item: Item) => item.id) as (item: object) => string | number,
        actionColumns: [
          {
            header: 'Name',
            cell: ((item: Item) => item.name) as (item: object) => React.ReactNode,
          },
        ],
        actionFn: cy.stub().resolves(),
        processingText: 'Deleting...',
        isDanger: true,
        onClose: () => setDialogOpen(false),
      };

      return (
        <div>
          {!isDialogOpen && (
            <Button
              onClick={() => {
                setDialogOpen(true);
                openBulkActionDialog(props);
              }}
            >
              Open Dialog
            </Button>
          )}
        </div>
      );
    }

    cy.mount(<TestComponent />);

    cy.get('button').click();
    cy.get('div').contains('Delete Items').should('be.visible');
  });
});

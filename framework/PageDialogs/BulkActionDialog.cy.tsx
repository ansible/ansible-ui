/* eslint-disable i18next/no-literal-string */
import { Button } from '@patternfly/react-core';
import { useState } from 'react';
import { BulkActionDialog, useBulkActionDialog } from './BulkActionDialog';

interface Item {
  id: number;
  name: string;
}

function TestComponent(props: { isSuccessful: boolean }) {
  const openBulkActionDialog = useBulkActionDialog();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { isSuccessful } = props;

  const dialogProps = {
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
    actionFn: isSuccessful ? cy.stub().resolves() : cy.stub().rejects(),
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
            openBulkActionDialog(dialogProps);
          }}
        >
          Open Dialog
        </Button>
      )}
    </div>
  );
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
    cy.mount(<TestComponent isSuccessful={true} />);

    cy.get('button').click();
    cy.get('div').contains('Delete Items').should('be.visible');
  });

  it('dialog auto-closes on success', () => {
    cy.mount(<TestComponent isSuccessful={true} />);

    cy.contains('button', 'Open Dialog').click();
    cy.get('div').contains('Success').should('be.visible');
    cy.wait(1000); // Dialog auto-closes after 1 second
    cy.getModal().should('not.exist');
  });

  it('dialog presents Retry and Close buttons on error', () => {
    cy.mount(<TestComponent isSuccessful={false} />);

    cy.contains('button', 'Open Dialog').click();
    cy.get('div').contains('Error').should('be.visible');
    cy.contains('button', 'Retry').should('be.visible');
    cy.contains('button', 'Close').should('be.visible');

    cy.contains('button', 'Close').click();
    cy.getModal().should('not.exist');
  });
});

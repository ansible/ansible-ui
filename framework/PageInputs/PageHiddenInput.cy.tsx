/* eslint-disable i18next/no-literal-string */
import { PageHiddenInput } from './PageHiddenInput';
import { Flex, FlexItem } from '@patternfly/react-core';

const TestComponent = () => {
  return (
    <Flex>
      <FlexItem>
        <input type="text" placeholder="Enter value" />
      </FlexItem>
      <FlexItem>
        <button>Submit</button>
      </FlexItem>
    </Flex>
  );
};

describe('PageHiddenInput Component Tests', () => {
  it('should display hidden value and clear button when shouldHideField is true', () => {
    cy.mount(
      <PageHiddenInput
        shouldHideField={true}
        onClear={() => {}}
        label="Test label"
        labelHelp="Test label Help"
      >
        <TestComponent />
      </PageHiddenInput>
    );
    cy.get('input[type="password"]').should('be.visible');
    cy.contains('Clear').should('be.visible');
    cy.contains('Test label').should('be.visible');
  });

  it('should display children, and not display Clear button when shouldHideField is false', () => {
    cy.mount(
      <PageHiddenInput
        shouldHideField={false}
        onClear={() => {}}
        label="Test Label"
        labelHelp="Test Label Help"
      >
        <TestComponent />
      </PageHiddenInput>
    );

    cy.get('input[type="text"]').should('be.visible');
    cy.contains('Submit').should('be.visible');
    cy.contains('Clear').should('not.exist');
  });

  it('should invoke onClear when the clear button is clicked and shouldHideField is true', () => {
    const onClear = cy.stub().as('onClear');

    cy.mount(
      <PageHiddenInput
        shouldHideField={true}
        onClear={onClear}
        label="Test Label"
        labelHelp="Test Label Help"
      >
        <TestComponent />
      </PageHiddenInput>
    );
    cy.contains('Clear').click();
    cy.get('@onClear').should('have.been.calledOnce');
  });
});

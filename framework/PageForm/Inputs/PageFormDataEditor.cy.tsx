/* eslint-disable i18next/no-literal-string */
import jsyaml from 'js-yaml';
import { PageForm } from '../PageForm';
import { PageFormDataEditor } from './PageFormDataEditor';

interface ExtraVars {
  vars: string;
}

interface WithObject {
  data: object;
}

describe('PageFormDataEditor', () => {
  it('should handle yaml string', () => {
    const onSubmit = cy.stub().as('onSubmit');

    cy.mount(
      <PageForm<ExtraVars>
        onSubmit={onSubmit}
        onCancel={() => null}
        submitText="Submit"
        defaultValue={{ vars: 'abc: 123' }}
      >
        <PageFormDataEditor<ExtraVars> label="Editor" name="vars" format="yaml" />
      </PageForm>
    );

    cy.contains('button', 'YAML').click();
    cy.contains('abc: 123').should('be.visible');
    cy.contains('button', 'Submit').click();
    cy.get('@onSubmit').should('have.have.been.calledWith', { vars: 'abc: 123' });

    onSubmit.resetHistory();

    cy.contains('button', 'JSON').click();
    cy.contains('"abc": 123').should('be.visible');
    cy.contains('button', 'Submit').click();
    cy.get('@onSubmit').should('have.have.been.calledWith', { vars: 'abc: 123' });
  });

  it('should handle json string', () => {
    const onSubmit = cy.stub().as('onSubmit');

    cy.mount(
      <PageForm<ExtraVars>
        onSubmit={onSubmit}
        onCancel={() => null}
        submitText="Submit"
        defaultValue={{ vars: '{ "abc": 123 }' }}
      >
        <PageFormDataEditor<ExtraVars> label="Editor" name="vars" format="json" />
      </PageForm>
    );

    cy.contains('button', 'YAML').click();
    cy.contains('abc: 123').should('be.visible');
    cy.contains('button', 'Submit').click();
    cy.get('@onSubmit').should('have.been.calledWith', {
      vars: JSON.stringify({ abc: 123 }, null, 2),
    });

    onSubmit.resetHistory();

    cy.contains('button', 'JSON').click();
    cy.contains('"abc": 123').should('be.visible');
    cy.contains('button', 'Submit').click();
    cy.get('@onSubmit').should('have.been.calledWith', {
      vars: JSON.stringify({ abc: 123 }, null, 2),
    });
  });

  it('should handle object data', () => {
    const onSubmit = cy.stub().as('onSubmit');

    cy.mount(
      <PageForm<WithObject>
        onSubmit={onSubmit}
        onCancel={() => null}
        submitText="Submit"
        defaultValue={{ data: { def: 456 } }}
      >
        <PageFormDataEditor<WithObject> label="Editor" name="data" format="object" />
      </PageForm>
    );

    cy.contains('button', 'YAML').click();
    cy.contains('def: 456').should('be.visible');
    cy.contains('button', 'Submit').click();
    cy.get('@onSubmit').should('have.been.calledWith', { data: { def: 456 } });

    onSubmit.resetHistory();

    cy.contains('button', 'JSON').click();
    cy.contains('"def": 456').should('be.visible');
    cy.contains('button', 'Submit').click();
    cy.get('@onSubmit').should('have.been.calledWith', { data: { def: 456 } });
  });

  it('should allow to upload a file', () => {
    const onSubmit = cy.stub().as('onSubmit');
    cy.mount(
      <PageForm<WithObject> onSubmit={onSubmit} onCancel={() => null} submitText="Submit">
        <PageFormDataEditor<WithObject> label="Editor" name="data" format="object" />
      </PageForm>
    );
    cy.fixture('extra_vars.yaml')
      .as('yamlFixture')
      .then((yaml: string) => {
        cy.get('input[type="file"]').selectFile('@yamlFixture', { force: true });
        cy.contains(yaml.split('\n')[0]).should('be.visible');
        cy.contains('button', 'Submit').click();
        cy.get('@onSubmit').should('have.been.calledWith', { data: jsyaml.load(yaml) });
      });
  });
});

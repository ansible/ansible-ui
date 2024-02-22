/* eslint-disable i18next/no-literal-string */
import { PageForm } from '../PageForm';
import { PageFormMarkdown } from './PageFormMarkdown';

const markdown = `# Title
## Subtitle`;

describe('PageFormMarkdownEditor', () => {
  it('should handle markdown', () => {
    const onSubmit = cy.stub().as('onSubmit');
    cy.mount(
      <PageForm<{ markdown: string }>
        onSubmit={onSubmit}
        onCancel={() => null}
        submitText="Submit"
        defaultValue={{ markdown }}
      >
        <PageFormMarkdown<{ markdown: string }> label="Editor" name="markdown" />
      </PageForm>
    );
    cy.getByDataCy('markdown').type('\nhello');
    cy.contains('button', 'Submit').click();
    cy.get('@onSubmit').should('have.have.been.calledWith', { markdown: markdown + '\nhello' });
  });
});

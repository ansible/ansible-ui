import { PageForm } from '../PageForm';
import { PageFormCodeEditor } from './PageFormCodeEditor';
import { PageFormSubmitHandler } from '../PageForm';
import { jsonToYaml } from '../../utils/codeEditorUtils';
describe('PageFormCodeEditor', () => {
  interface CodeEditor {
    extra_vars: string;
  }
  const yaml = `
---
one: 1
two: two
`;

  const json = `{
  "one": 1,
  "two": "two"
}
`;

  const object = {
    jsonToYaml,
  };
  const spy: () => string = cy.spy(object, 'jsonToYaml').as('jsToYaml');
  const jsToYamlReturn = spy.withArgs(json).as('jsToYamlReturn');

  expect(spy).to.be.called.with(json);
  expect(spy).returned(yaml);

  const onSubmit: PageFormSubmitHandler<CodeEditor> = async () => {};
  test('should mount properly', () => {
    <PageForm<CodeEditor>
      submitText={'Save job template'}
      onSubmit={onSubmit}
      onCancel={() => {}}
      defaultValue={{ extra_vars: yaml }}
    >
      <PageFormCodeEditor name="extra_vars" />
    </PageForm>;
  });
});

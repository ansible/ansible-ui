import { PageDetail, PageDetails } from '@ansible/ansible-ui-framework';
import {
  CodeBlock,
  CodeBlockCode,
  Grid,
  GridItem,
  PageSection,
  Title,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { getDeprecationDescription } from './hooks/useDeprecationData';

const DEPRECATION_REMEDIATION: Record<string, string> = {
  'with_items on module':
    'Replace with_items with a list passed directly to the module parameter. For example, use the `packages` parameter of yum/dnf/apt with a list value instead of looping.',
  'Bare variables in conditionals':
    'Wrap variables in when conditions with {{ }} Jinja2 syntax, or use is defined / is not defined tests. Example: `when: my_var is defined` or `when: "{{ my_var }}".',
  'include directive':
    'Replace `include:` with `import_tasks:` for static includes or `include_tasks:` for dynamic includes. Static imports are resolved at parse time; dynamic includes at runtime.',
  'with_dict loop':
    'Replace `with_dict:` with `loop:` combined with the `dict2items` filter. Example: `loop: "{{ my_dict | dict2items }}"` and access keys/values via `item.key` and `item.value`.',
  squash_actions:
    'Update to use the `loop` keyword instead of deprecated squash_actions behavior. Ensure your ansible.cfg does not set `squash_actions`.',
  hash_behaviour:
    'Remove `hash_behaviour = merge` from ansible.cfg and update playbooks to use the `combine` filter explicitly where hash merging is needed.',
};

const DEPRECATION_IMPACT: Record<string, string> = {
  'with_items on module': 'Removed in Ansible Core 2.17',
  'Bare variables in conditionals': 'Removed in Ansible Core 2.16',
  'include directive': 'Removed in Ansible Core 2.16',
  'with_dict loop': 'Removed in Ansible Core 2.17',
  squash_actions: 'Removed in Ansible Core 2.17',
  hash_behaviour: 'Removed in Ansible Core 2.17',
};

interface CodeExample {
  before: string;
  after: string;
}

const DEPRECATION_EXAMPLES: Record<string, CodeExample> = {
  'with_items on module': {
    before: `- name: Install packages
  ansible.builtin.yum:
    name: "{{ item }}"
    state: present
  with_items:
    - httpd
    - vim
    - curl`,
    after: `- name: Install packages
  ansible.builtin.yum:
    name:
      - httpd
      - vim
      - curl
    state: present`,
  },
  'Bare variables in conditionals': {
    before: `- name: Start service
  ansible.builtin.service:
    name: httpd
    state: started
  when: enable_httpd`,
    after: `- name: Start service
  ansible.builtin.service:
    name: httpd
    state: started
  when: enable_httpd | bool`,
  },
  'include directive': {
    before: `- include: tasks/setup.yml
  vars:
    env: production`,
    after: `- ansible.builtin.import_tasks: tasks/setup.yml
  vars:
    env: production

# or for dynamic includes:
- ansible.builtin.include_tasks: tasks/setup.yml`,
  },
  'with_dict loop': {
    before: `- name: Create users
  ansible.builtin.user:
    name: "{{ item.key }}"
    uid: "{{ item.value.uid }}"
  with_dict: "{{ users }}"`,
    after: `- name: Create users
  ansible.builtin.user:
    name: "{{ item.key }}"
    uid: "{{ item.value.uid }}"
  loop: "{{ users | dict2items }}"`,
  },
  squash_actions: {
    before: `# ansible.cfg
[defaults]
squash_actions = yum,apt,pip`,
    after: `# ansible.cfg — remove squash_actions entirely
# Use loop with the module's list parameter instead:
- ansible.builtin.yum:
    name: "{{ packages }}"
    state: present`,
  },
  hash_behaviour: {
    before: `# ansible.cfg
[defaults]
hash_behaviour = merge`,
    after: `# ansible.cfg — remove hash_behaviour setting
# Use the combine filter explicitly in playbooks:
- ansible.builtin.set_fact:
    merged: "{{ defaults | combine(overrides, recursive=true) }}"`,
  },
};

export function DeprecationDetails() {
  const { t } = useTranslation();
  const { deprecationType } = useParams<{ deprecationType: string }>();
  const decodedType = decodeURIComponent(deprecationType ?? '');

  const remediation = DEPRECATION_REMEDIATION[decodedType];
  const impact = DEPRECATION_IMPACT[decodedType];
  const example = DEPRECATION_EXAMPLES[decodedType];

  return (
    <>
      <PageDetails numberOfColumns="multiple" disableScroll>
        <PageDetail label={t('Pattern')}>{decodedType}</PageDetail>
        <PageDetail label={t('Description')}>{getDeprecationDescription(decodedType)}</PageDetail>
        {impact && <PageDetail label={t('Impact')}>{impact}</PageDetail>}
        {remediation && <PageDetail label={t('Recommended remediation')}>{remediation}</PageDetail>}
      </PageDetails>

      {example && (
        <PageSection style={{ paddingTop: 'var(--pf-t--global--spacer--md)' }}>
          <Title
            headingLevel="h3"
            size="md"
            style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
          >
            {t('Resolution')}
          </Title>
          <Grid hasGutter md={6}>
            <GridItem>
              <Title
                headingLevel="h4"
                size="md"
                style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
              >
                {t('Before (deprecated)')}
              </Title>
              <CodeBlock>
                <CodeBlockCode>{example.before}</CodeBlockCode>
              </CodeBlock>
            </GridItem>
            <GridItem>
              <Title
                headingLevel="h4"
                size="md"
                style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
              >
                {t('After (recommended)')}
              </Title>
              <CodeBlock>
                <CodeBlockCode>{example.after}</CodeBlockCode>
              </CodeBlock>
            </GridItem>
          </Grid>
        </PageSection>
      )}
    </>
  );
}

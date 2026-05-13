import { PageDetail, PageDetails } from '@ansible/ansible-ui-framework';
import { Label } from '@patternfly/react-core';
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

const DEPRECATION_DOCS: Record<string, string> = {
  'with_items on module':
    'https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_loops.html',
  'Bare variables in conditionals':
    'https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_conditionals.html',
  'include directive':
    'https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse.html',
  'with_dict loop': 'https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_loops.html',
  squash_actions: 'https://docs.ansible.com/ansible/latest/reference_appendices/config.html',
  hash_behaviour:
    'https://docs.ansible.com/ansible/latest/reference_appendices/config.html#default-hash-behaviour',
};

const DEPRECATION_SEVERITY: Record<
  string,
  { label: string; color: 'red' | 'orange' | 'blue' | 'green' }
> = {
  'with_items on module': { label: 'Hot', color: 'red' },
  'Bare variables in conditionals': { label: 'Warm', color: 'orange' },
  'include directive': { label: 'Warm', color: 'orange' },
  'with_dict loop': { label: 'Moderate', color: 'blue' },
  squash_actions: { label: 'Cool', color: 'green' },
  hash_behaviour: { label: 'Cool', color: 'green' },
};

export function DeprecationDetails() {
  const { t } = useTranslation();
  const { deprecationType } = useParams<{ deprecationType: string }>();
  const decodedType = decodeURIComponent(deprecationType ?? '');

  const severity = DEPRECATION_SEVERITY[decodedType];
  const remediation = DEPRECATION_REMEDIATION[decodedType];
  const docsUrl = DEPRECATION_DOCS[decodedType];

  return (
    <PageDetails>
      <PageDetail label={t('Deprecation Type')}>{decodedType}</PageDetail>
      <PageDetail label={t('Description')}>{getDeprecationDescription(decodedType)}</PageDetail>
      {severity && (
        <PageDetail label={t('Severity')}>
          <Label color={severity.color}>{t(severity.label)}</Label>
        </PageDetail>
      )}
      {remediation && <PageDetail label={t('Recommended Remediation')}>{remediation}</PageDetail>}
      {docsUrl && (
        <PageDetail label={t('Documentation')}>
          <a href={docsUrl} target="_blank" rel="noopener noreferrer">
            {t('Ansible Documentation')}
          </a>
        </PageDetail>
      )}
    </PageDetails>
  );
}

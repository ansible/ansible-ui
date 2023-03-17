import { JobTemplateForm } from '../../interfaces/JobTemplateForm';

export function getJobTemplateDefaultValues(
  t: (string: string) => string,
  template?: JobTemplateForm
) {
  return {
    id: template?.id || undefined,
    organization: template?.organization || undefined,
    allow_callbacks: template?.allow_callbacks || false,
    allow_simultaneous: template?.allow_simultaneous || false,
    ask_credential_on_launch: template?.ask_credential_on_launch || false,
    ask_diff_mode_on_launch: template?.ask_diff_mode_on_launch || false,
    ask_execution_environment_on_launch: template?.ask_execution_environment_on_launch || false,
    ask_forks_on_launch: template?.ask_forks_on_launch || false,
    ask_instance_groups_on_launch: template?.ask_instance_groups_on_launch || false,
    ask_inventory_on_launch: template?.ask_inventory_on_launch || false,
    ask_job_slice_count_on_launch: template?.ask_job_slice_count_on_launch || false,
    ask_job_type_on_launch: template?.ask_job_type_on_launch || false,
    ask_labels_on_launch: template?.ask_labels_on_launch || false,
    ask_limit_on_launch: template?.ask_limit_on_launch || false,
    ask_scm_branch_on_launch: template?.ask_scm_branch_on_launch || false,
    ask_skip_tags_on_launch: template?.ask_skip_tags_on_launch || false,
    ask_tags_on_launch: template?.ask_tags_on_launch || false,
    ask_timeout_on_launch: template?.ask_timeout_on_launch || false,
    ask_variables_on_launch: template?.ask_variables_on_launch || false,
    ask_verbosity_on_launch: template?.ask_verbosity_on_launch || false,
    become_enabled: template?.become_enabled || false,
    related: { webhook_receiver: template?.related?.webhook_receiver || '' },
    summary_fields: {
      credentials: template?.summary_fields?.credentials || [],
      labels: { results: template?.summary_fields?.labels?.results || undefined },
      inventory: {
        name: template?.summary_fields?.inventory?.name || '',
        id: template?.summary_fields?.inventory?.id,
      },
      project: {
        name: template?.summary_fields?.project?.name || '',
        id: template?.summary_fields?.project?.id,
      },
      execution_environment: {
        name: template?.summary_fields?.execution_environment?.name || '',
        id: template?.summary_fields?.execution_environment?.id,
      },
      webhook_credential: template?.summary_fields?.webhook_credential || undefined,
    },
    credentials: template?.summary_fields?.credentials || [],
    description: template?.description || '',
    diff_mode: template?.diff_mode || false,
    extra_vars: template?.extra_vars || '---\n',
    forks: template?.forks || 0,
    host_config_key: template?.host_config_key || '',
    initialInstanceGroups: [],
    instanceGroups: [],
    inventoryId: template?.summary_fields?.inventory?.id,
    project: template?.project || undefined,
    job_slice_count: template?.job_slice_count || 1,
    job_tags: template?.job_tags,
    job_type: template?.job_type || 'run',
    labels: template?.summary_fields?.labels?.results || [],
    limit: template?.limit || '',
    name: template?.name || '',
    playbook: template?.playbook || '',
    prevent_instance_group_fallback: template?.prevent_instance_group_fallback || false,
    scm_branch: template?.scm_branch || '',
    skip_tags: template?.skip_tags,
    timeout: template?.timeout || 0,
    use_fact_cache: template?.use_fact_cache || false,
    verbosity: template?.verbosity ?? 0,
    webhook_service: template?.webhook_service || '',
    webhook_url: template?.related?.webhook_receiver
      ? `${document.location.origin}${template?.related.webhook_receiver}`
      : t('a new webhook url will be generated on save.').toUpperCase(),
    webhook_key:
      template?.webhook_key || t('a new webhook key will be generated on save.').toUpperCase(),
    webhook_credential: template?.summary_fields?.webhook_credential || null,
    execution_environment: template?.summary_fields?.execution_environment || null,
  };
}

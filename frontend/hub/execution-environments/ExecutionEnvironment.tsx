export interface ExecutionEnvironment {
  id: string
  pulp_href: string
  name: string
  pulp: {
    repository: {
      id: string
      pulp_type: string
      version: number
      name: string
      description?: string
      created_at: string
      updated_at: string
      pulp_labels: object
      remote: {
        id: string
        pulp_href: string
        name: string
        upstream_name: string
        registry: string
        last_sync_task: object
        created_at: string
        updated_at: string
        include_foreign_layers: boolean
        include_tags: string[]
        exclude_tags: string[]
      }
      sign_state: 'unsigned' | 'signed'
    }
    distribution: {
      id: string
      name: string
      created_at: string
      updated_at: string
      base_path: string
      pulp_labels: object
    }
  }
  namespace: {
    id: string
    pulp_href: string
    name: string
    my_permissions: string[]
    owners: string[]
    created_at: string
    updated_at: string
  }
  description?: string
  created_at: string
  updated_at: string
}

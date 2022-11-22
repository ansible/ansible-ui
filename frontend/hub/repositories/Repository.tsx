export interface Repository {
  pulp_id: string
  name: string
  base_path: string
  repository: {
    name: string
    description?: string
    pulp_id: string
    pulp_last_updated: string
    content_count: number
    gpgkey: string | null
  }
}

export interface RemoteRepository {
  auth_url: string | null
  ca_cert: string | null
  pulclient_cert: string | null
  created_at: string
  download_concurrency: number | null
  last_sync_task: {
    error?: {
      description: string
      traceback: string
    }
    finished_at: string
    started_at: string
    state: string
    task_id: string
  }
  name: string
  pk: string
  policy: string
  proxy: string | null
  proxy_username: string | null
  pulp_href: string
  rate_limit: number
  repositories: {
    name: string
    created_at: string
    updated_at: string
    description: string
    next_version: number
    distributions: {
      created_at: string
      updated_at: string
      base_path: string
      content_guard: string
      name: string
    }[]
    last_sync_task: {
      error?: {
        description: string
        traceback: string
      }
      finished_at: string
      started_at: string
      state: string
      task_id: string
    }
  }[]

  requirements_file: string | null
  signed_only: string | null
  tls_validation: string | null
  updated_at: string | null
  url: string | null
  usename: string | null
}

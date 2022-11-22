export interface RemoteRegistry {
  ca_cert: number
  client_cert: number
  name: string
  pk: string
  created_at: string
  updated_at: string
  download_concurrency: number | null
  url: string
}

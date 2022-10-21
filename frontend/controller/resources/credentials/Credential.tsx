export interface Credential {
  type: 'credential'
  id: number
  name: string
  description?: string
  created: string
  modified: string
  organization: number | null
  managed: boolean
  kubernetes: boolean
  kind: 'galaxy_api_token' | 'ssh'
  credential_type: number
}

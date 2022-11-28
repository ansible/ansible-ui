export interface Approval {
  id: string
  namespace: string
  name: string
  version: string
  requires_ansible: string
  created_at: string
  metadata: {
    dependencies: { string: string }
    contents: { name: string; description: string; content_type: string }[]
    documentation: string
    homepage: string
    issues: string
    repository: string
    description: string
    authors: string[]
    license: string[]
    tags: string[]
    signatures: string[]
  }
  contents: [
    {
      name: string
      content_type: string
      description: string
    }
  ]
  sign_state: 'unsigned' | 'signed'
  repository_list: ('staging' | 'published')[]
}

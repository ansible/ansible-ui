export interface Instance {
    type: 'instance'
    id: number
    hostname: string
    created: string
    modified: string
    organization: number | null

    capacity: number
    capacity_adjustment: number
    consumed_capacity: number
    cpu: number
    cpu_capacity: number
    enabled: boolean
    errors: string
    jobs_running: number
    jobs_total: number
    last_health_check: string
    last_seen: string
    managed_by_policy: boolean
    mem_capacity: number
    memory: number
    node_type: 'hybrid' | 'execution' | 'hop'
    percent_capacity_remaining: number
    uuid: string
    version: string
}

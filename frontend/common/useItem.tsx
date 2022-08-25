import useSWR from 'swr'
import { useFetcher } from '../Data'

export function useItem<T = unknown>(url: string, id: string) {
    const fetcher = useFetcher()
    const { data } = useSWR<T>(`${url}/${id}/`, fetcher)
    return data
}

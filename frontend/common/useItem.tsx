import useSWR from 'swr'
import { swrOptions, useFetcher } from '../Data'

export function useItem<T = unknown>(url: string, id: string) {
    const fetcher = useFetcher()
    const { data } = useSWR<T>(`${url}/${id}/`, fetcher, swrOptions)
    return data
}

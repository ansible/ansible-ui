import useSWR from 'swr'
import { swrOptions, useFetcher } from '../Data'

export function useItem<T = unknown>(url: string, id: string | number) {
  const fetcher = useFetcher()
  const { data } = useSWR<T>(`${url}/${id}/`, fetcher, swrOptions)
  return data
}

export function useGet<T = unknown>(url: string) {
  const fetcher = useFetcher()
  return useSWR<T>(url, fetcher, swrOptions)
}

// export function useOptionFilters<T extends object>(options?: IOptions) {
//     const organizations = useOrganizations()
//     const filters = useMemo(() => {
//         const gets = options?.actions?.GET
//         if (!gets) return []
//         const filterKeys = Object.keys(gets).filter((key) => gets[key].filterable === true)
//         return filterKeys.reduce<IItemFilter<T>[]>((filters, key) => {
//             const value = gets[key]
//             console.log(value)
//             switch (value.type) {
//                 case 'choice':
//                     filters.push({
//                         label: value.label,
//                         options: value.choices.map((choice) => ({ label: choice[1], value: choice[0] })),
//                         filter: (item: T, values: string[]) => {
//                             return false
//                         },
//                     })
//                     break
//                 case 'id':
//                     filters.push({
//                         label: value.label,
//                         options: organizations?.map((organization) => ({ label: organization.name, value: organization.id })) ?? [],
//                         filter: (item: T, values: string[]) => {
//                             return false
//                         },
//                     })
//                     break
//             }
//             return filters
//         }, [])
//     }, [options])
//     return filters
// }

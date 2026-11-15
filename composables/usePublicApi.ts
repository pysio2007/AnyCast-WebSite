/**
 * Client-side fetchers for public data sources. Everything is fetched in the browser
 * on page load so visitors always see current data (no build-time snapshots).
 */

type Query = Record<string, string | number | boolean | undefined>

/** RIPEstat Data API: https://stat.ripe.net/docs/data-api */
export function useRipeStat<T>(call: MaybeRefOrGetter<string>, query: MaybeRefOrGetter<Query>) {
  return useFetch(() => `https://stat.ripe.net/data/${toValue(call)}/data.json`, {
    query: computed(() => ({ ...toValue(query), sourceapp: 'anycast-ink' })),
    key: computed(() => `ripestat:${toValue(call)}:${JSON.stringify(toValue(query))}`),
    server: false,
    lazy: true,
    transform: (res: { data: T }) => res.data,
  })
}

/** PeeringDB API: https://www.peeringdb.com/apidocs/ */
export function usePeeringDb<T>(resource: MaybeRefOrGetter<string>, query: MaybeRefOrGetter<Query>) {
  return useFetch(() => `https://www.peeringdb.com/api/${toValue(resource)}`, {
    query: computed(() => toValue(query)),
    key: computed(() => `peeringdb:${toValue(resource)}:${JSON.stringify(toValue(query))}`),
    server: false,
    lazy: true,
    transform: (res: { data: T[] }) => res.data,
  })
}

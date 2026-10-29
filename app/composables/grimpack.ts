import type { InjectionKey, Ref } from 'vue'
import type { Item } from '~~/server/utils/grimpack'

export const useGrimpackNav = () => useFetch('/api/grimpack/nav', { key: 'grimpack-nav' })

/** The items a chapter shows, keyed by "id@meta"; provided by the chapter page. */
export const ITEMS: InjectionKey<Ref<Record<string, Item>>> = Symbol('grimpack-items')

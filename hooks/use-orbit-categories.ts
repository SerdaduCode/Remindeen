import { storage } from '#imports'
import { useEffect, useState } from 'react'

export interface OrbitCategory {
  id: string
  name: string
  color: string
}

export const DEFAULT_CATEGORY_ID = 'default'
const DEFAULT_CATEGORY_COLOR = '#9ca3af'

const orbitCategoriesStorage = storage.defineItem<OrbitCategory[]>('local:orbitCategories', {
  fallback: [],
})

// An empty selection means "no filter" (every category is shown).
const activeCategoryFiltersStorage = storage.defineItem<string[]>('local:orbitActiveCategoryFilters', {
  fallback: [],
})

export function useOrbitCategories(defaultCategoryName: string) {
  const [categories, setCategories] = useState<OrbitCategory[]>([])
  const [activeFilters, setActiveFiltersState] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orbitCategoriesStorage.getValue().then(async (value) => {
      if (value.length === 0) {
        const seeded: OrbitCategory[] = [
          { id: DEFAULT_CATEGORY_ID, name: defaultCategoryName, color: DEFAULT_CATEGORY_COLOR },
        ]
        await orbitCategoriesStorage.setValue(seeded)
        setCategories(seeded)
      } else {
        setCategories(value)
      }
      setLoading(false)
    })

    const unwatchCategories = orbitCategoriesStorage.watch((newVal) => {
      setCategories(newVal || [])
    })

    activeCategoryFiltersStorage.getValue().then((value) => setActiveFiltersState(value ?? []))
    const unwatchFilter = activeCategoryFiltersStorage.watch((newVal) => {
      setActiveFiltersState(newVal ?? [])
    })

    return () => {
      unwatchCategories()
      unwatchFilter()
    }
    // defaultCategoryName is only used for first-run seeding; re-running this
    // effect on language change would re-seed/overwrite a user-renamed category.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const persistCategories = async (next: OrbitCategory[]) => {
    setCategories(next)
    await orbitCategoriesStorage.setValue(next)
  }

  const createCategory = async (input: { name: string; color: string }) => {
    const newCategory: OrbitCategory = {
      id: crypto.randomUUID(),
      name: input.name,
      color: input.color,
    }
    await persistCategories([...categories, newCategory])
    return newCategory
  }

  const renameCategory = async (id: string, name: string) => {
    await persistCategories(categories.map((category) => (category.id === id ? { ...category, name } : category)))
  }

  const recolorCategory = async (id: string, color: string) => {
    await persistCategories(categories.map((category) => (category.id === id ? { ...category, color } : category)))
  }

  const deleteCategory = async (id: string) => {
    if (id === DEFAULT_CATEGORY_ID) return
    await persistCategories(categories.filter((category) => category.id !== id))
    if (activeFilters.includes(id)) {
      await persistActiveFilters(activeFilters.filter((filterId) => filterId !== id))
    }
  }

  const persistActiveFilters = async (next: string[]) => {
    setActiveFiltersState(next)
    await activeCategoryFiltersStorage.setValue(next)
  }

  const toggleFilter = async (id: string) => {
    await persistActiveFilters(
      activeFilters.includes(id)
        ? activeFilters.filter((filterId) => filterId !== id)
        : [...activeFilters, id]
    )
  }

  const clearFilters = async () => {
    await persistActiveFilters([])
  }

  return {
    categories,
    loading,
    activeFilters,
    toggleFilter,
    clearFilters,
    createCategory,
    renameCategory,
    recolorCategory,
    deleteCategory,
  }
}

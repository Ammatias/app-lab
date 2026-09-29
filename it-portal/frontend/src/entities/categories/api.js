export async function fetchCategories() {
  const response = await fetch('/api/categories')
  if (!response.ok) throw new Error('Failed to fetch categories')
  return response.json()
}

export async function fetchCategoryItems(categoryId) {
  const response = await fetch(`/api/categories/${categoryId}/items`)
  if (!response.ok) throw new Error('Failed to fetch category items')
  return response.json()
}

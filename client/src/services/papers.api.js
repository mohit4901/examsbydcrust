const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function getPapers(params = {}) {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });

  const response = await fetch(`${API_BASE}/papers?${queryParams}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch papers');
  }

  return response.json();
}

export async function getFilters() {
  const response = await fetch(`${API_BASE}/papers/filters`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch filters');
  }

  const result = await response.json();
  return result.data;
}

export async function getStats() {
  const response = await fetch(`${API_BASE}/papers/stats`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }

  const result = await response.json();
  return result.data;
}
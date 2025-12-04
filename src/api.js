// src/api.js
const API_BASE_URL = 'https://pets.xn--80ahdri7a.site/api';



// Функция для запросов с авторизацией
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Ошибка ${response.status}`);
  }

  return response.json();
}

// Функция для загрузки файлов (multipart/form-data)
async function fetchAPIWithFormData(endpoint, formData, options = {}) {
  const token = localStorage.getItem('authToken');
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    method: options.method || 'POST',
    body: formData,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Ошибка ${response.status}`);
  }

  return response.json();
}

// API функции
export const api = {
  // Главная страница
  getSlider: () => fetchAPI('/pets/slider'),
  getPets: () => fetchAPI('/pets'),
  
  // Поиск
  search: (query) => fetchAPI(`/search?query=${encodeURIComponent(query)}`),
  advancedSearch: (params) => {
    const queryParams = new URLSearchParams();
    if (params.district) queryParams.append('district', params.district);
    if (params.kind) queryParams.append('kind', params.kind);
    
    const queryString = queryParams.toString();
    return fetchAPI(`/search/order${queryString ? '?' + queryString : ''}`);
  },
  
  // Авторизация
  login: (credentials) => fetchAPI('/login', {
    method: 'POST',
    body: credentials,
  }),
  
  register: (userData) => fetchAPI('/register', {
    method: 'POST',
    body: userData,
  }),
  
  // Пользователь
  getUser: (id) => fetchAPI(`/users/${id}`),
  updatePhone: (id, phone) => fetchAPI(`/users/${id}/phone`, {
    method: 'PATCH',
    body: { phone },
  }),
  updateEmail: (id, email) => fetchAPI(`/users/${id}/email`, {
    method: 'PATCH',
    body: { email },
  }),
  
  // Объявления пользователя
  getUserOrders: (id) => fetchAPI(`/users/orders/${id}`),
  deleteOrder: (id) => fetchAPI(`/users/orders/${id}`, {
    method: 'DELETE',
  }),
  
  // Карточка животного
  getPet: (id) => fetchAPI(`/pets/${id}`),
  
  // Добавление/редактирование животного
  addPet: (formData) => fetchAPIWithFormData('/pets/new', formData),
  updatePet: (id, formData) => fetchAPIWithFormData(`/pets/${id}`, formData, {
    method: 'PATCH',
  }),
  
  // Подписка
  subscribe: (email) => fetchAPI('/subscription', {
    method: 'POST',
    body: { email },
  }),
};
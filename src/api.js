// src/api.js
const API_BASE_URL = 'https://pets.xn--80ahdri7a.site/api';
const IMAGE_BASE_URL = 'https://pets.xn--80ahdri7a.site/storage/images';

// Вспомогательная функция для получения полного URL изображения
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Если уже полный URL
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Если путь начинается с /storage/images, убираем эту часть
  if (imagePath.startsWith('/storage/images/')) {
    return `https://pets.xn--80ahdri7a.site${imagePath}`;
  }
  
  // Если просто имя файла
  return `${IMAGE_BASE_URL}/${imagePath}`;
};

// Функция для обработки данных животных (добавление полных URL изображений)
export const processPetData = (pet) => {
  if (!pet) return pet;
  
  const processed = { ...pet };
  
  // Обработка основного изображения
  if (pet.image) {
    processed.image = getImageUrl(pet.image);
  }
  
  // Обработка массива фотографий
  if (pet.photos && Array.isArray(pet.photos)) {
    processed.photos = pet.photos.map(photo => getImageUrl(photo));
  }
  
  // Если нет ни image, ни photos, добавляем заглушку
  if (!processed.image && (!processed.photos || processed.photos.length === 0)) {
    processed.image = 'https://via.placeholder.com/300x200?text=Нет+фото';
  }
  
  // Форматируем дату для отображения
  if (processed.date) {
    // Если дата в формате ДД-ММ-ГГГГ, преобразуем в ДД.ММ.ГГГГ
    if (processed.date.includes('-')) {
      processed.date = processed.date.split('-').join('.');
    }
  }
  
  return processed;
};

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
  
  // Карточка животного
  getPet: (id) => fetchAPI(`/pets/${id}`),
  
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
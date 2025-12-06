// src/api.js
const API_BASE_URL = 'https://pets.xn--80ahdri7a.site/api';
const IMAGE_BASE_URL = 'https://pets.xn--80ahdri7a.site/storage/images';

// Вспомогательная функция для получения полного URL изображения
export const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath === 'undefined' || imagePath === 'null') return null;
  
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
  
  // Обработка массива фотографий - исправлено для некорректных форматов
  processed.photos = [];
  
  if (pet.photos) {
    if (Array.isArray(pet.photos)) {
      // Фильтруем некорректные значения и преобразуем в URL
      processed.photos = pet.photos
        .filter(photo => photo && 
                        typeof photo === 'string' && 
                        photo !== 'undefined' && 
                        photo !== 'null' && 
                        photo.trim() !== '')
        .map(photo => getImageUrl(photo));
    } else if (typeof pet.photos === 'string') {
      // Если photos - строка с числами, разделенными запятыми
      const photoStrings = pet.photos.split(',').map(str => str.trim());
      processed.photos = photoStrings
        .filter(str => str && 
                      str !== 'undefined' && 
                      str !== 'null' && 
                      !/^\d+$/.test(str)) // Исключаем чистые числа
        .map(str => getImageUrl(str));
    }
  }
  
  // Если нет ни image, ни photos, добавляем заглушку
  if (!processed.image && processed.photos.length === 0) {
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

  // Если неавторизован и запрос требует авторизации
  if (response.status === 401 && token) {
    // Токен истек или невалиден
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = '/sign-in';
    throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Ошибка ${response.status}`);
  }

  return response.json();
}

// Функция для загрузки файлов (multipart/form-data)
async function fetchAPIWithFormData(endpoint, formData, options = {}) {
  const token = localStorage.getItem('authToken');
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    method: options.method || 'POST',
    body: formData,
    headers,
  });

  // Если неавторизован и запрос требует авторизации
  if (response.status === 401 && token) {
    // Токен истек или невалиден
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = '/sign-in';
    throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Ошибка ${response.status}`);
  }

  return response.json();
}

// API функции
export const api = {
  // =================== ПОЛЬЗОВАТЕЛИ ===================
  
  // Получить информацию о текущем пользователе
  getCurrentUser: () => fetchAPI('/users/'),
  
  // Получить информацию о конкретном пользователе
  getUser: (id) => fetchAPI(`/users/${id}`),
  
  // Обновить телефон пользователя
  updatePhone: (phone) => fetchAPI('/users/phone', {
    method: 'PATCH',
    body: { phone },
  }),
  
  // Обновить email пользователя
  updateEmail: (email) => fetchAPI('/users/email', {
    method: 'PATCH',
    body: { email },
  }),
  
  // =================== ОБЪЯВЛЕНИЯ ПОЛЬЗОВАТЕЛЯ ===================
  
  // Получить все объявления пользователя
  getUserOrders: () => fetchAPI('/users/orders'),
  
  // Удалить объявление пользователя
  deleteOrder: (id) => fetchAPI(`/users/orders/${id}`, {
    method: 'DELETE',
  }),
  
  // =================== ЖИВОТНЫЕ (ПИТОМЦЫ) ===================
  
  // Главная страница - слайдер
  getSlider: () => fetchAPI('/pets/slider'),
  
  // Получить всех питомцев (с пагинацией)
  getPets: () => fetchAPI('/pets'),
  
  // Получить конкретного питомца по ID
  getPet: (id) => fetchAPI(`/pets/${id}`),
  
  // Добавить нового питомца
  addPet: (formData) => fetchAPIWithFormData('/pets/new', formData),
  
  // Обновить питомца
  updatePet: (id, formData) => fetchAPIWithFormData(`/pets/${id}`, formData, {
    method: 'PATCH',
  }),
  
  // =================== ПОИСК ===================
  
  // Быстрый поиск (для подсказок)
  search: (query) => fetchAPI(`/search?query=${encodeURIComponent(query)}`),
  
  // Автодополнение
  autocomplete: (query) => fetchAPI(`/search/autocomplete?query=${encodeURIComponent(query)}`),
  
  // Расширенный поиск
  advancedSearch: (params) => {
    const queryParams = new URLSearchParams();
    if (params.district) queryParams.append('district', params.district);
    if (params.kind) queryParams.append('kind', params.kind);
    
    const queryString = queryParams.toString();
    return fetchAPI(`/search/order${queryString ? '?' + queryString : ''}`);
  },
  
  // =================== АВТОРИЗАЦИЯ ===================
  
  // Вход
  login: (credentials) => fetchAPI('/login', {
    method: 'POST',
    body: credentials,
  }),
  
  // Регистрация
  register: (userData) => fetchAPI('/register', {
    method: 'POST',
    body: {
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      password: userData.password,
      password_confirmation: userData.password,
      confirm: userData.agree ? 1 : 0
    },
  }),
  
  // =================== ПОДПИСКА ===================
  
  // Подписка на рассылку
  subscribe: (email) => fetchAPI('/subscription', {
    method: 'POST',
    body: { email },
  }),
  
  // =================== ВСПОМОГАТЕЛЬНЫЕ ===================
  
  // Проверить авторизацию
  checkAuth: () => {
    const token = localStorage.getItem('authToken');
    if (!token) return Promise.reject(new Error('Not authenticated'));
    
    return fetchAPI('/users/');
  },
  
  // Выйти из системы (клиентская функция)
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    return Promise.resolve();
  }
};

// Дополнительные вспомогательные функции
export const auth = {
  // Проверить авторизацию
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
  
  // Получить токен
  getToken: () => {
    return localStorage.getItem('authToken');
  },
  
  // Получить данные пользователя
  getUserData: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },
  
  // Сохранить данные пользователя после входа
  setUserData: (token, userData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
  },
  
  // Очистить данные авторизации
  clear: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }
};

// Функция для обработки ошибок API
export const handleApiError = (error, context) => {
  console.error(`API Error in ${context}:`, error);
  
  // Если это ошибка сети
  if (error.message === 'Failed to fetch') {
    return 'Ошибка сети. Проверьте подключение к интернету.';
  }
  
  // Если неавторизован
  if (error.message.includes('401')) {
    return 'Необходима авторизация. Пожалуйста, войдите в систему.';
  }
  
  // Если доступ запрещен
  if (error.message.includes('403')) {
    return 'Доступ запрещен. У вас нет прав для выполнения этого действия.';
  }
  
  // Если не найдено
  if (error.message.includes('404')) {
    return 'Запрашиваемый ресурс не найден.';
  }
  
  // Если ошибка валидации
  if (error.message.includes('422')) {
    return 'Ошибка валидации данных. Проверьте введенные данные.';
  }
  
  // Вернуть оригинальное сообщение об ошибке
  return error.message || 'Произошла неизвестная ошибка';
};
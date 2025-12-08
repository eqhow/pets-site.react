// api.js - исправленная версия с корректным endpoint для добавления питомца

const API_BASE_URL = 'https://pets.xn--80ahdri7a.site/api';
const IMAGE_BASE_URL = 'https://pets.xn--80ahdri7a.site/storage/images';

// Вспомогательная функция для получения полного URL изображения
export const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath === 'undefined' || imagePath === 'null') return null;
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('/storage/images/')) {
    return `https://pets.xn--80ahdri7a.site${imagePath}`;
  }
  
  return `${IMAGE_BASE_URL}/${imagePath}`;
};

// Функция для обработки данных животных
export const processPetData = (pet) => {
  if (!pet) return pet;
  
  const processed = { ...pet };
  
  if (pet.image) {
    processed.image = getImageUrl(pet.image);
  }
  
  processed.photos = [];
  
  if (pet.photos) {
    if (Array.isArray(pet.photos)) {
      processed.photos = pet.photos
        .filter(photo => photo && typeof photo === 'string')
        .map(photo => getImageUrl(photo));
    } else if (typeof pet.photos === 'string') {
      const photoStrings = pet.photos.split(',').map(str => str.trim());
      processed.photos = photoStrings
        .filter(str => str && !/^\d+$/.test(str))
        .map(str => getImageUrl(str));
    }
  }
  
  if (!processed.image && processed.photos.length === 0) {
    processed.image = 'https://via.placeholder.com/300x200?text=Нет+фото';
  }
  
  if (processed.date) {
    if (processed.date.includes('-')) {
      processed.date = processed.date.split('-').join('.');
    }
  }
  
  return processed;
};

// Улучшенная функция для запросов с токеном
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }

  console.log('Отправка запроса:', {
    endpoint: `${API_BASE_URL}${endpoint}`,
    method: options.method || 'GET',
    headers,
    body
  });

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      body,
    });

    console.log('Статус ответа:', response.status);

    // Обрабатываем ответ
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      responseData = { message: responseText };
    }

    // Если 401 - очищаем токен
    if (response.status === 401) {
      if (token) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
      throw new Error('Unauthenticated');
    }

    // Проверяем, успешен ли ответ
    if (!response.ok) {
      // Обработка ошибок валидации 422
      if (response.status === 422) {
        if (responseData.error?.errors) {
          const errors = responseData.error.errors;
          let errorMessages = [];
          
          for (const [, fieldErrors] of Object.entries(errors)) {
            if (Array.isArray(fieldErrors)) {
              errorMessages.push(...fieldErrors);
            } else {
              errorMessages.push(fieldErrors);
            }
          }
          
          throw new Error(`Ошибка валидации: ${errorMessages.join(', ')}`);
        }
      }
      
      throw new Error(responseData.message || `Ошибка ${response.status}: ${response.statusText}`);
    }

    console.log('Успешный ответ:', responseData);
    return responseData;

  } catch (error) {
    console.error('Ошибка fetchAPI:', error);
    
    if (error.message === 'Failed to fetch') {
      throw new Error('Ошибка сети. Проверьте подключение к интернету.');
    }
    
    throw error;
  }
}

// Функция для загрузки файлов
async function fetchAPIWithFormData(endpoint, formData, options = {}) {
  const token = localStorage.getItem('authToken');
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: options.method || 'POST',
      body: formData,
      headers,
    });

    if (response.status === 401 && token) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/sign-in';
      throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `Ошибка ${response.status}: ${response.statusText}` };
      }
      throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
    }

    try {
      return await response.json();
    } catch {
      const text = await response.text();
      return { data: text };
    }

  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Ошибка сети при загрузке файла.');
    }
    
    throw error;
  }
}

// API функции
export const api = {
  // =================== ПОЛЬЗОВАТЕЛИ ===================
  
  // Получить информацию о текущем пользователе (по токену)
  getCurrentUser: () => fetchAPI('/users').then(response => {
    console.log('Ответ от /users (по токену):', response);
    
    // API может возвращать данные в разных форматах
    if (response.data) {
      if (Array.isArray(response.data)) {
        return { data: response.data[0] || {} };
      }
      if (response.data.user && Array.isArray(response.data.user)) {
        return { data: response.data.user[0] || {} };
      }
      return response;
    }
    
    return { data: response || {} };
  }),
  
  // Обновить телефон пользователя (по токену)
  updatePhone: (phone) => fetchAPI('/users/phone', {
    method: 'PATCH',
    body: { phone },
  }),
  
  // Обновить email пользователя (по токену)
  updateEmail: (email) => fetchAPI('/users/email', {
    method: 'PATCH',
    body: { email },
  }),
  
  // =================== ОБЪЯВЛЕНИЯ ПОЛЬЗОВАТЕЛЯ ===================
  
  // Получить все объявления пользователя (по токену)
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
  
  // Добавить нового питомца - КЛЮЧЕВАЯ ИЗМЕНЕНИЕ! Исправлен endpoint
  addPet: (formData) => fetchAPIWithFormData('/pets', formData, {
    method: 'POST',
  }),
  
  // Обновить питомца (редактирование)
  updatePet: (id, formData) => fetchAPIWithFormData(`/pets/${id}`, formData, {
  method: 'POST',
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
  
  // Вход (email или телефон)
  login: (identifier, password) => {
    // Определяем, это email или телефон
    const isEmail = identifier.includes('@');
    
    const body = isEmail 
      ? { email: identifier, password }
      : { phone: identifier, password };
    
    console.log('Данные для входа:', body);
    
    return fetchAPI('/login', {
      method: 'POST',
      body: body,
    });
  },
  
  // Регистрация
  register: (userData) => {
    console.log('Получены данные для регистрации:', userData);
    
    // Форматируем данные для API
    const preparedData = {
      name: String(userData.name || '').trim(),
      phone: (userData.phone || '').replace(/\D/g, ''), // Только цифры
      email: String(userData.email || '').trim().toLowerCase(),
      password: String(userData.password || ''),
      password_confirmation: String(userData.password_confirmation || ''),
      confirm: userData.confirm ? 1 : 0
    };
    
    console.log('Отправляемые данные регистрации:', preparedData);
    
    return fetchAPI('/register', {
      method: 'POST',
      body: preparedData,
    });
  },
  
  // =================== ПОДПИСКА ===================
  
  // Подписка на рассылку - ИСПРАВЛЕННАЯ ВЕРСИЯ
  subscribe: async (emailData) => {
    // emailData должен быть объектом с полем email
    if (!emailData || !emailData.email) {
      throw new Error('Email обязателен для подписки');
    }
    
    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.email)) {
      throw new Error('Пожалуйста, введите корректный email адрес');
    }
    
    // Подготавливаем данные для отправки
    const body = {
      email: emailData.email.trim().toLowerCase()
    };
    
    console.log('Подписка: отправка данных', body);
    
    try {
      const response = await fetchAPI('/subscription', {
        method: 'POST',
        body: body,
      });
      
      return response;
    } catch (error) {
      console.error('Ошибка при подписке:', error);
      
      // Парсим сообщение об ошибке для более понятного вывода
      if (error.message && error.message.includes('email') && error.message.includes('valid')) {
        throw new Error('Пожалуйста, введите корректный email адрес');
      }
      
      if (error.message && (error.message.includes('already') || error.message.includes('уже'))) {
        throw new Error('Этот email уже подписан на рассылку');
      }
      
      throw error;
    }
  },
  
  // =================== ВСПОМОГАТЕЛЬНЫЕ ===================
  
  // Проверить авторизацию
  checkAuth: () => {
    const token = localStorage.getItem('authToken');
    if (!token) return Promise.reject(new Error('Not authenticated'));
    
    return fetchAPI('/users');
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
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
  
  getToken: () => {
    return localStorage.getItem('authToken');
  },
  
  getUserData: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },
  
  setUserData: (token, userData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
  },
  
  clear: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }
};
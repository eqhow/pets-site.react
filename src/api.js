// api.js - полностью переработанный

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
        .filter(photo => photo && 
                        typeof photo === 'string' && 
                        photo !== 'undefined' && 
                        photo !== 'null' && 
                        photo.trim() !== '')
        .map(photo => getImageUrl(photo));
    } else if (typeof pet.photos === 'string') {
      const photoStrings = pet.photos.split(',').map(str => str.trim());
      processed.photos = photoStrings
        .filter(str => str && 
                      str !== 'undefined' && 
                      str !== 'null' && 
                      !/^\d+$/.test(str))
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

// Улучшенная функция для запросов с таймаутом
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
    body: body ? JSON.parse(body) : null
  });

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      body,
    });

    const responseText = await response.text();
    console.log('Сырой ответ сервера:', responseText);
    console.log('Статус ответа:', response.status);

    let responseData;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
      console.log('Парсинг JSON успешен:', responseData);
    } catch (parseError) {
      console.error('Ошибка парсинга JSON:', parseError);
      responseData = { message: 'Invalid JSON response' };
    }

    // Обрабатываем различные статусы ответа
    if (response.status === 401 && token) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/sign-in';
      throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
    }

    if (!response.ok) {
      // Детали ошибки валидации 422
      if (response.status === 422) {
        console.error('Ошибка 422, детали:', responseData);
        
        if (responseData.error && responseData.error.errors) {
          // Форматируем ошибки валидации
          const errors = responseData.error.errors;
          let errorMessages = [];
          
          for (const [field, fieldErrors] of Object.entries(errors)) {
            if (Array.isArray(fieldErrors)) {
              errorMessages.push(...fieldErrors);
            } else {
              errorMessages.push(fieldErrors);
            }
          }
          
          throw new Error(`Ошибка валидации: ${errorMessages.join(', ')}`);
        } else if (responseData.error && responseData.error.message) {
          throw new Error(responseData.error.message);
        } else if (responseData.message) {
          throw new Error(responseData.message);
        }
      }
      
      // Общая обработка ошибок
      const errorMessage = responseData.error?.message || 
                          responseData.message || 
                          `Ошибка ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    // Возвращаем успешный ответ
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 секунд для загрузки файлов

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: options.method || 'POST',
      body: formData,
      headers,
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
    });

    clearTimeout(timeoutId);

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
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Превышено время ожидания загрузки файла.');
    } else if (error.message === 'Failed to fetch') {
      throw new Error('Ошибка сети при загрузке файла.');
    }
    
    throw error;
  }
}

// API функции
export const api = {
  // =================== ПОЛЬЗОВАТЕЛИ ===================
  
 // Получить информацию о текущем пользователе
getCurrentUser: () => fetchAPI('/users/').then(response => {
  console.log('Ответ от /users/ :', response);
  
  // API может возвращать данные в разных форматах
  if (response.data) {
    // Если data - это объект с user
    if (response.data.user && Array.isArray(response.data.user)) {
      return { data: response.data.user[0] };
    }
    // Если data - это массив
    else if (Array.isArray(response.data)) {
      return { data: response.data[0] };
    }
    // Если data - это объект пользователя
    else if (response.data.id) {
      return response;
    }
  }
  
  // Если формат непонятен, возвращаем как есть
  return response;
}),
  
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
  
  // Вход
  login: (credentials) => fetchAPI('/login', {
    method: 'POST',
    body: credentials,
  }),
  
  // Регистрация - УПРОЩЕННАЯ ВЕРСИЯ
  register: (userData) => {
  // Форматируем телефон - пробуем разные варианты
  let phone = userData.phone || '';
  
  // Очищаем от всего кроме цифр
  const digits = phone.replace(/\D/g, '');
  
  // Пробуем разные форматы
  let formattedPhone = '';
  if (digits.startsWith('7') || digits.startsWith('8')) {
    formattedPhone = digits;
  } else if (digits.length === 10) {
    // Если 10 цифр, добавляем 7 в начало
    formattedPhone = '7' + digits;
  } else {
    // Оставляем как есть
    formattedPhone = digits;
  }
  
  const preparedData = {
    name: String(userData.name || '').trim(),
    phone: formattedPhone,
    email: String(userData.email || '').trim(),
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

// Функция для обработки ошибок API
export const handleApiError = (error, context) => {
  console.error(`API Error in ${context}:`, error);
  
  if (error.message === 'Failed to fetch') {
    return 'Ошибка сети. Проверьте подключение к интернету.';
  }
  
  if (error.message.includes('Превышено время ожидания')) {
    return 'Сервер не отвечает. Попробуйте позже.';
  }
  
  if (error.message.includes('401')) {
    return 'Необходима авторизация. Пожалуйста, войдите в систему.';
  }
  
  if (error.message.includes('403')) {
    return 'Доступ запрещен. У вас нет прав для выполнения этого действия.';
  }
  
  if (error.message.includes('404')) {
    return 'Запрашиваемый ресурс не найден.';
  }
  
  if (error.message.includes('422')) {
    // Уже содержит детальное сообщение об ошибке валидации
    return error.message;
  }
  
  if (error.message.includes('CORS')) {
    return 'Ошибка доступа к серверу. Пожалуйста, сообщите администратору.';
  }
  
  return error.message || 'Произошла неизвестная ошибка';
};
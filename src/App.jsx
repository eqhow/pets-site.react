import React, { createContext, useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Main from './components/pages/Main';
import Footer from './components/Footer';
import AdvancedSearch from './components/pages/AdvancedSearch';
import AddPet from './components/pages/AddPet';
import SignIn from './components/pages/SignIn';
import Registration from './components/pages/Registration';
import Profile from './components/pages/Profile';
import Card from './components/pages/Card';
import AlertComponent from './components/AlertComponent';
import './assets/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Routes, Route, useNavigate } from "react-router-dom";
import { api, processPetData } from './api';

// Контексты
export const AuthContext = createContext(null);
export const PetsContext = createContext(null);
export const AlertContext = createContext(null);

function App() {
  const navigate = useNavigate();
  
  // Состояние авторизации
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    return {
      isLoggedIn: !!token,
      token: token,
      user: userData ? JSON.parse(userData) : null,
    };
  });

  // Состояние животных
  const [pets, setPets] = useState({
    allPets: [],
    sliderPets: [],
    filteredPets: [],
    filters: { district: '', kind: '' },
    pagination: { currentPage: 1, itemsPerPage: 6, totalPages: 0 }
  });

  // Состояние уведомлений
  const [alerts, setAlerts] = useState([]);

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const userResponse = await api.checkAuth();
          console.log('Проверка авторизации:', userResponse);
          
          let userData;
          
          // Обрабатываем разные форматы ответа
          if (userResponse.data) {
            userData = userResponse.data;
          } else if (userResponse.id) {
            userData = userResponse;
          } else if (Array.isArray(userResponse) && userResponse.length > 0) {
            userData = userResponse[0];
          } else {
            throw new Error('Данные пользователя не получены');
          }
          
          // Расчет количества дней с регистрации
          let daysSinceRegistration = 0;
          if (userData.registrationDate) {
            const registrationDate = new Date(userData.registrationDate);
            const today = new Date();
            daysSinceRegistration = Math.floor((today - registrationDate) / (1000 * 60 * 60 * 24));
          }
          
          const updatedUserData = {
            ...userData,
            daysSinceRegistration
          };
          
          console.log('Обновленные данные пользователя:', updatedUserData);
          
          localStorage.setItem('userData', JSON.stringify(updatedUserData));
          
          setAuth({
            isLoggedIn: true,
            token: token,
            user: updatedUserData,
          });
        } catch (error) {
          console.error('Ошибка проверки авторизации:', error);
          // Если токен невалиден, очищаем localStorage
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          setAuth({
            isLoggedIn: false,
            token: null,
            user: null,
          });
          showAlert('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
        }
      }
    };
    
    checkAuth();
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      // Загружаем слайдер
      const sliderResponse = await api.getSlider();
      const sliderPets = (sliderResponse.data?.pets || []).map(processPetData);

      // Загружаем все животные
      const petsResponse = await api.getPets();
      const allPets = (petsResponse.data?.orders || []).map(processPetData);

      // Сортируем по дате (сначала новые)
      const sortedPets = [...allPets].sort((a, b) => {
        try {
          if (!a.date || !b.date) return 0;
          const dateA = new Date(b.date.split('.').reverse().join('-'));
          const dateB = new Date(a.date.split('.').reverse().join('-'));
          return dateA.getTime() - dateB.getTime();
        } catch {
          return 0;
        }
      });

      setPets(prev => ({
        ...prev,
        allPets: sortedPets,
        sliderPets: sliderPets,
        filteredPets: sortedPets,
        pagination: {
          ...prev.pagination,
          totalPages: Math.ceil(sortedPets.length / prev.pagination.itemsPerPage)
        }
      }));
    } catch (error) {
      console.error('Ошибка загрузки животных:', error);
      showAlert('Ошибка загрузки данных', 'danger');
    }
  };

  // Функции авторизации
  const loginUser = async (identifier, password) => {
    try {
      console.log('Попытка входа:', { identifier, password });
      
      // Определяем, что ввел пользователь: email или телефон
      const isEmail = identifier.includes('@');
      
      // Используем правильный метод API
      const response = await api.login(identifier, password);
      console.log('Ответ API при входе:', response);
      
      // Проверяем наличие токена в разных форматах ответа
      let token;
      
      if (response.data && response.data.token) {
        token = response.data.token;
      } else if (response.token) {
        token = response.token;
      } else if (response.data?.token) {
        token = response.data.token;
      } else {
        throw new Error('Токен не получен от сервера');
      }
      
      // Сохраняем токен
      localStorage.setItem('authToken', token);
      console.log('Токен сохранен:', token);
      
      // Получаем информацию о пользователе
      try {
        const userResponse = await api.getCurrentUser();
        console.log('Данные пользователя:', userResponse);
        
        let userData;
        
        // Обрабатываем разные форматы ответа
        if (userResponse.data && userResponse.data.id) {
          userData = userResponse.data;
        } else if (userResponse.id) {
          userData = userResponse;
        } else if (Array.isArray(userResponse) && userResponse.length > 0) {
          userData = userResponse[0];
        } else {
          // Создаем базовые данные, если API не вернул
          userData = {
            id: 1,
            name: identifier.includes('@') ? identifier.split('@')[0] : 'Пользователь',
            phone: !identifier.includes('@') ? identifier : '',
            email: identifier.includes('@') ? identifier : '',
            registrationDate: new Date().toISOString()
          };
        }
        
        // Расчет количества дней с регистрации
        let daysSinceRegistration = 0;
        if (userData.registrationDate) {
          const registrationDate = new Date(userData.registrationDate);
          const today = new Date();
          daysSinceRegistration = Math.floor((today - registrationDate) / (1000 * 60 * 60 * 24));
        }
        
        const updatedUserData = {
          ...userData,
          daysSinceRegistration
        };
        
        // Сохраняем данные пользователя
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        
        // Обновляем состояние
        setAuth({
          isLoggedIn: true,
          token: token,
          user: updatedUserData,
        });
        
        showAlert('Вход выполнен успешно!', 'success');
        return true;
      } catch (userError) {
        console.error('Ошибка получения данных пользователя:', userError);
        // Создаем базовые данные
        const defaultUserData = {
          id: 1,
          name: identifier.includes('@') ? identifier.split('@')[0] : 'Пользователь',
          phone: !identifier.includes('@') ? identifier : '',
          email: identifier.includes('@') ? identifier : '',
          registrationDate: new Date().toISOString(),
          daysSinceRegistration: 0
        };
        
        localStorage.setItem('userData', JSON.stringify(defaultUserData));
        
        setAuth({
          isLoggedIn: true,
          token: token,
          user: defaultUserData,
        });
        
        showAlert('Вход выполнен успешно!', 'success');
        return true;
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      
      // Определяем тип ошибки
      let errorMessage = 'Ошибка входа';
      
      if (error.message.includes('401') || 
          error.message.includes('Unauthorized') || 
          error.message.includes('Unauthenticated')) {
        errorMessage = 'Неверный логин или пароль';
      } else if (error.message.includes('422')) {
        errorMessage = 'Ошибка валидации данных';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
      } else {
        errorMessage = error.message || 'Ошибка входа. Проверьте логин и пароль.';
      }
      
      showAlert(errorMessage, 'danger');
      return false;
    }
  };

  const registerUser = async (userData) => {
    try {
      console.log('Регистрация пользователя:', userData);
      
      const response = await api.register({
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password_confirmation,
        confirm: userData.confirm ? 1 : 0
      });
      
      console.log('Ответ API при регистрации:', response);
      
      // Проверяем успешность регистрации
      if (response.data && response.data.message) {
        showAlert(response.data.message, 'success');
      } else if (response.status === 'ok' || response.message === 'Registration successful') {
        showAlert('Регистрация прошла успешно', 'success');
      } else {
        showAlert('Регистрация прошла успешно', 'success');
      }
      
      // Пытаемся автоматически войти
      try {
        const loginSuccess = await loginUser(userData.email, userData.password);
        return { success: true, autoLogin: loginSuccess };
      } catch (loginError) {
        console.log('Автоматический вход не удался, требуется ручной вход');
        return { success: true, autoLogin: false };
      }
      
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      
      // Более подробная обработка ошибок
      let errorMessage = 'Ошибка регистрации';
      
      if (error.message.includes('422')) {
        errorMessage = 'Ошибка валидации данных. Проверьте введенные данные.';
      } else if (error.message.includes('400')) {
        errorMessage = 'Неверный запрос. Проверьте формат данных.';
      } else if (error.message.includes('409') || error.message.includes('already exists')) {
        errorMessage = 'Пользователь с таким email или телефоном уже существует.';
      } else {
        errorMessage = error.message || 'Ошибка регистрации';
      }
      
      showAlert(errorMessage, 'danger');
      throw error;
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setAuth({ isLoggedIn: false, token: null, user: null });
    showAlert('Вы вышли из системы', 'info');
    navigate('/');
  };

  const updateUser = async (updates) => {
    if (!auth.user) return false;
    
    try {
      if (updates.phone !== undefined) {
        await api.updatePhone(updates.phone);
      }
      if (updates.email !== undefined) {
        await api.updateEmail(updates.email);
      }
      
      // Обновляем данные пользователя
      const updatedUser = { ...auth.user, ...updates };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setAuth(prev => ({ ...prev, user: updatedUser }));
      
      showAlert('Данные успешно обновлены', 'success');
      return true;
    } catch (error) {
      console.error('Ошибка обновления данных пользователя:', error);
      showAlert('Ошибка обновления данных: ' + error.message, 'danger');
      return false;
    }
  };

  // Функции для животных
  const filterPets = useCallback(async (filters) => {
    try {
      const params = {};
      if (filters.district) params.district = filters.district;
      if (filters.kind) params.kind = filters.kind;
      
      console.log('Поиск с параметрами:', params);
      const response = await api.advancedSearch(params);
      const filtered = (response.data?.orders || []).map(processPetData);
      
      console.log('Найдено животных:', filtered.length);
      
      setPets(prev => ({
        ...prev,
        filteredPets: filtered,
        filters,
        pagination: {
          ...prev.pagination,
          currentPage: 1,
          totalPages: Math.ceil(filtered.length / prev.pagination.itemsPerPage)
        }
      }));
    } catch (error) {
      console.error('Ошибка поиска:', error);
      showAlert('Ошибка поиска: ' + error.message, 'danger');
    }
  }, []);

  const resetFilters = useCallback(() => {
    setPets(prev => ({
      ...prev,
      filteredPets: prev.allPets,
      filters: { district: '', kind: '' },
      pagination: {
        ...prev.pagination,
        currentPage: 1,
        totalPages: Math.ceil(prev.allPets.length / prev.pagination.itemsPerPage)
      }
    }));
  }, []);

  const setCurrentPage = useCallback((page) => {
    setPets(prev => ({
      ...prev,
      pagination: { ...prev.pagination, currentPage: page }
    }));
  }, []);

  // Функции для уведомлений
  const showAlert = (message, type = 'info') => {
    const id = Date.now();
    const newAlert = { id, message, type };
    
    setAlerts(prev => {
      // Ограничиваем количество уведомлений
      const updatedAlerts = [...prev, newAlert];
      if (updatedAlerts.length > 3) {
        return updatedAlerts.slice(-3);
      }
      return updatedAlerts;
    });
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 5000);
  };

  const authContextValue = {
    ...auth,
    loginUser,
    logoutUser,
    registerUser,
    updateUser,
    refreshPets: loadPets
  };

  const petsContextValue = {
    ...pets,
    filterPets,
    resetFilters,
    setCurrentPage,
    loadPets
  };

  const alertContextValue = {
    alerts,
    showAlert
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <PetsContext.Provider value={petsContextValue}>
        <AlertContext.Provider value={alertContextValue}>
          <div className="d-flex flex-column min-vh-100">
            <Header />
            <main className="flex-grow-1">
              <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/advancedsearch" element={<AdvancedSearch />} />
                <Route path="/add-pet" element={<AddPet />} />
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/pet/:id" element={<Card />} />
              </Routes>
            </main>
            <Footer />
            <AlertComponent />
          </div>
        </AlertContext.Provider>
      </PetsContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
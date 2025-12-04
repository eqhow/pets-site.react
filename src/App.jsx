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
import { Routes, Route } from "react-router-dom";
import { api, processPetData } from './api';

// Контексты
export const AuthContext = createContext(null);
export const PetsContext = createContext(null);
export const AlertContext = createContext(null);

function App() {
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

  // Загрузка животных
  useEffect(() => {
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
          const dateA = new Date(b.date.split('-').reverse().join('-'));
          const dateB = new Date(a.date.split('-').reverse().join('-'));
          return dateA - dateB;
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
      showAlert('Ошибка загрузки данных', 'danger');
    }
  };

  // Функции авторизации
  const loginUser = async (identifier, password) => {
    try {
      const response = await api.login({
        email: identifier,
        password: password
      });
      
      if (response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        // Получаем информацию о пользователе
        // В реальном API нужно декодировать токен или запросить /api/users/current
        const userData = {
          id: response.data.user?.id || 1,
          name: response.data.user?.name || 'Пользователь',
          phone: response.data.user?.phone || identifier,
          email: response.data.user?.email || (identifier.includes('@') ? identifier : null),
          registrationDate: new Date().toISOString()
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setAuth({
          isLoggedIn: true,
          token: response.data.token,
          user: userData,
        });
        
        showAlert('Вход выполнен успешно', 'success');
        return true;
      }
    } catch (error) {
      showAlert('Неверный логин или пароль', 'danger');
      return false;
    }
  };

  const registerUser = async (userData) => {
    try {
      const response = await api.register({
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password,
        confirm: userData.agree ? 1 : 0
      });
      
      showAlert('Регистрация прошла успешно', 'success');
      return true;
    } catch (error) {
      showAlert('Ошибка регистрации: ' + error.message, 'danger');
      return false;
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setAuth({ isLoggedIn: false, token: null, user: null });
    showAlert('Вы вышли из системы', 'info');
  };

  const updateUser = async (updates) => {
    if (!auth.user) return;
    
    try {
      if (updates.phone) {
        await api.updatePhone(auth.user.id, updates.phone);
      }
      if (updates.email) {
        await api.updateEmail(auth.user.id, updates.email);
      }
      
      const updatedUser = { ...auth.user, ...updates };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setAuth(prev => ({ ...prev, user: updatedUser }));
      
      showAlert('Данные обновлены', 'success');
    } catch (error) {
      showAlert('Ошибка обновления данных: ' + error.message, 'danger');
    }
  };

  // Функции для животных
  const filterPets = useCallback(async (filters) => {
    try {
      const params = {};
      if (filters.district) params.district = filters.district;
      if (filters.kind) params.kind = filters.kind;
      
      const response = await api.advancedSearch(params);
      const filtered = (response.data?.orders || []).map(processPetData);
      
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
      showAlert('Ошибка поиска', 'danger');
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
  const showAlert = (message, type = 'danger') => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 5000);
  };

  const authContextValue = {
    ...auth,
    loginUser,
    logoutUser,
    registerUser,
    updateUser
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
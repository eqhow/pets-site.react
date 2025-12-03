import React, { createContext, useState } from 'react';
import Header from './components/Header';
import Main from './components/pages/Main';
import Footer from './components/Footer';
import AdvancedSearch from './components/pages/AdvancedSearch';
import AddPet from './components/pages/AddPet';
import SignIn from './components/pages/SignIn';
import Registration from './components/pages/Registration';
import Profile from './components/pages/Profile';
import Card from './components/pages/Card';

import './assets/css/style.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { Routes, Route } from "react-router-dom";

// Контекст для авторизации
export const AuthContext = createContext(null);
// Контекст для животных
export const PetsContext = createContext(null);
// Контекст для уведомлений
export const AlertContext = createContext(null);

// Мок-данные для животных (можно вынести в отдельный файл)
const mockPets = [
  { id: 1, kind: 'Собака', district: 'Центральный', description: 'Найдена собака, рыжего окраса, среднего размера, очень дружелюбный.', date: '15.06.2025', image: 'https://i.postimg.cc/Hkkmpdh8/pes-ryzij.jpg' },
  { id: 2, kind: 'Кошка', district: 'Василеостровский', description: 'Найдена кошка, пушистая, серая с белым, приучена к лотку.', date: '12.06.2025', image: 'https://i.postimg.cc/vHWT1YhK/koska-seraa.jpg' },
  { id: 3, kind: 'Птица', district: 'Адмиралтейский', description: 'Найден попугай, волнистый попугай голубого окраса, умеет говорить несколько слов.', date: '10.06.2025', image: 'https://i.postimg.cc/L527NVdk/popugaj.jpg' },
  // ... остальные животные
];

function App() {
  // Состояние авторизации
  const [auth, setAuth] = useState(() => {
    const savedUser = localStorage.getItem('findpets_current_user');
    return {
      isLoggedIn: !!savedUser,
      user: savedUser ? JSON.parse(savedUser) : null,
      users: JSON.parse(localStorage.getItem('findpets_users')) || []
    };
  });

  // Состояние животных
  const [pets, setPets] = useState({
    allPets: mockPets,
    filteredPets: [],
    currentPet: null,
    filters: { district: '', kind: '' },
    pagination: { currentPage: 1, itemsPerPage: 6, totalPages: 0 }
  });

  // Состояние уведомлений
  const [alerts, setAlerts] = useState([]);

  // Функции авторизации
  const registerUser = (userData) => {
    // Проверка на существующего пользователя
    if (auth.users.find(user => user.email === userData.email)) {
      showAlert('Пользователь с таким email уже существует', 'danger');
      return false;
    }
    
    if (auth.users.find(user => user.phone === userData.phone)) {
      showAlert('Пользователь с таким номером телефона уже существует', 'danger');
      return false;
    }

    const newUser = {
      ...userData,
      id: Date.now(),
      registrationDate: new Date().toISOString()
    };

    const updatedUsers = [...auth.users, newUser];
    localStorage.setItem('findpets_users', JSON.stringify(updatedUsers));
    
    setAuth(prev => ({
      ...prev,
      users: updatedUsers
    }));

    showAlert('Регистрация прошла успешно', 'success');
    return true;
  };

  const loginUser = (identifier, password) => {
    const user = auth.users.find(user => 
      (user.email === identifier || user.phone === identifier) && 
      user.password === password
    );

    if (user) {
      localStorage.setItem('findpets_current_user', JSON.stringify(user));
      setAuth(prev => ({
        ...prev,
        isLoggedIn: true,
        user
      }));
      showAlert('Вход выполнен успешно', 'success');
      return true;
    } else {
      showAlert('Неверный email/телефон или пароль', 'danger');
      return false;
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('findpets_current_user');
    setAuth(prev => ({
      ...prev,
      isLoggedIn: false,
      user: null
    }));
    showAlert('Вы успешно вышли из аккаунта', 'info');
  };

  const updateUser = (updates) => {
    const updatedUsers = auth.users.map(user => 
      user.id === auth.user.id ? { ...user, ...updates } : user
    );
    
    const updatedUser = { ...auth.user, ...updates };
    
    localStorage.setItem('findpets_users', JSON.stringify(updatedUsers));
    localStorage.setItem('findpets_current_user', JSON.stringify(updatedUser));
    
    setAuth(prev => ({
      ...prev,
      users: updatedUsers,
      user: updatedUser
    }));
    
    showAlert('Данные обновлены', 'success');
  };

  // Функции для животных
  const filterPets = (filters) => {
    const filtered = mockPets.filter(pet => {
      const districtMatch = !filters.district || pet.district === filters.district;
      const kindMatch = !filters.kind || 
        pet.kind.toLowerCase().includes(filters.kind.toLowerCase()) ||
        pet.description.toLowerCase().includes(filters.kind.toLowerCase());
      return districtMatch && kindMatch;
    });

    setPets(prev => ({
      ...prev,
      filteredPets: filtered,
      filters,
      pagination: { ...prev.pagination, currentPage: 1 }
    }));
  };

  const resetFilters = () => {
    setPets(prev => ({
      ...prev,
      filteredPets: [],
      filters: { district: '', kind: '' },
      pagination: { ...prev.pagination, currentPage: 1 }
    }));
  };

  const setCurrentPet = (pet) => {
    setPets(prev => ({ ...prev, currentPet: pet }));
  };

  const setCurrentPage = (page) => {
    setPets(prev => ({
      ...prev,
      pagination: { ...prev.pagination, currentPage: page }
    }));
  };

  // Функции для уведомлений
  const showAlert = (message, type = 'danger') => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 5000);
  };

  // Значения контекстов
  const authContextValue = {
    ...auth,
    registerUser,
    loginUser,
    logoutUser,
    updateUser
  };

  const petsContextValue = {
    ...pets,
    filterPets,
    resetFilters,
    setCurrentPet,
    setCurrentPage
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
          </div>
        </AlertContext.Provider>
      </PetsContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
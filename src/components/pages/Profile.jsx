import React, { useState, useContext } from 'react';
import { AuthContext, PetsContext, AlertContext } from '../../App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from "react-router-dom";

function Profile() {
  const { user, updateUser, logoutUser } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const navigate = useNavigate();

  // Мок-данные объявлений пользователя
  const [userPets, setUserPets] = useState([
    { id: 1, title: 'Найдена кошка, порода Сфинкс', district: 'Василеостровский', date: '01-06-2025', status: 'moderation' },
    { id: 2, title: 'Найдена собака, порода Лабрадор', district: 'Центральный', date: '15-05-2025', status: 'active' },
    { id: 3, title: 'Найден попугай, волнистый', district: 'Адмиралтейский', date: '10-04-2025', status: 'found' },
    { id: 4, title: 'Найдена кошка, рыжая', district: 'Фрунзенский', date: '22-03-2025', status: 'archive' },
  ]);

  // Состояние для форм редактирования
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Расчет периода регистрации
  const getRegistrationPeriod = (registrationDate) => {
    const regDate = new Date(registrationDate);
    const now = new Date();
    
    let years = now.getFullYear() - regDate.getFullYear();
    let months = now.getMonth() - regDate.getMonth();
    let days = now.getDate() - regDate.getDate();
    
    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    const declension = (number, titles) => {
      const cases = [2, 0, 1, 1, 1, 2];
      return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
    };
    
    let result = '';
    if (years > 0) result += years + ' ' + declension(years, ['год', 'года', 'лет']) + ', ';
    if (months > 0) result += months + ' ' + declension(months, ['месяц', 'месяца', 'месяцев']) + ', ';
    result += days + ' ' + declension(days, ['день', 'дня', 'дней']);
    return result;
  };

  // Обработчик изменения телефона
  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    
    const phoneRegex = /^[\+\d]+$/;
    if (!editPhone.trim()) {
      setPhoneError('Телефон обязателен для заполнения');
      return;
    }
    if (!phoneRegex.test(editPhone)) {
      setPhoneError('Телефон должен содержать только цифры и знак +');
      return;
    }
    
    updateUser({ phone: editPhone });
    setPhoneError('');
  };

  // Обработчик изменения email
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    
    const emailRegex = /\S+@\S+\.\S+/;
    if (!editEmail.trim()) {
      setEmailError('Email обязателен для заполнения');
      return;
    }
    if (!emailRegex.test(editEmail)) {
      setEmailError('Пожалуйста, введите корректный email');
      return;
    }
    
    updateUser({ email: editEmail });
    setEmailError('');
  };

  // Обработчик выхода
  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      logoutUser();
      navigate('/');
    }
  };

  // Обработчик удаления объявления
  const handleDeletePet = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить это объявление?')) {
      setUserPets(prev => prev.filter(pet => pet.id !== id));
      showAlert('Объявление успешно удалено!', 'success');
    }
  };

  // Обработчик редактирования объявления
  const handleEditPet = (id) => {
    navigate(`/edit-pet/${id}`);
    // Здесь будет переход на страницу редактирования
  };

  // Статусы объявлений
  const statusConfig = {
    moderation: { text: 'На модерации', className: 'badge-moderation' },
    active: { text: 'Активное', className: 'badge-active' },
    found: { text: 'Хозяин найден', className: 'badge-found' },
    archive: { text: 'В архиве', className: 'badge-archive' }
  };

  if (!user) {
    navigate('/sign-in');
    return null;
  }

  return (
    <div id="profile" className="page fade-in">
      <div className="container my-5">
        <h2 className="section-title">Личный кабинет</h2>
        
        <div className="row">
          {/* Информация о пользователе */}
          <div className="col-lg-4 mb-4">
            <div className="card">
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-person-circle profile-avatar" />
                </div>
                <h4>{user.name}</h4>
                <p className="text-muted">
                  Зарегистрирован: {getRegistrationPeriod(user.registrationDate)}
                </p>
                <div className="row text-center mt-3">
                  <div className="col-6">
                    <div className="stats-card rounded-3 p-2 mb-2">
                      <h5>{userPets.length}</h5>
                      <small>Объявления</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="stats-card rounded-3 p-2 mb-2">
                      <h5>{userPets.filter(pet => pet.status === 'found').length}</h5>
                      <small>Найдены хозяева</small>
                    </div>
                  </div>
                </div>
                <button 
                  className="btn btn-outline-primary btn-sm mt-3 btn-animated"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-1" />
                  Выйти
                </button>
              </div>
            </div>
            
            {/* Форма изменения телефона */}
            <div className="card mt-4">
              <div className="card-body">
                <h5 className="card-title">Изменить телефон</h5>
                <form id="phone-form" onSubmit={handlePhoneSubmit}>
                  <div className="mb-3">
                    <input
                      type="tel"
                      className={`form-control ${phoneError ? 'is-invalid' : ''}`}
                      value={editPhone}
                      onChange={(e) => {
                        setEditPhone(e.target.value);
                        if (phoneError) setPhoneError('');
                      }}
                      required
                    />
                    {phoneError && (
                      <div className="invalid-feedback">{phoneError}</div>
                    )}
                  </div>
                  <button type="submit" className="btn btn-primary w-100 btn-animated">
                    Сохранить
                  </button>
                </form>
              </div>
            </div>
            
            {/* Форма изменения email */}
            <div className="card mt-4">
              <div className="card-body">
                <h5 className="card-title">Изменить email</h5>
                <form id="email-form" onSubmit={handleEmailSubmit}>
                  <div className="mb-3">
                    <input
                      type="email"
                      className={`form-control ${emailError ? 'is-invalid' : ''}`}
                      value={editEmail}
                      onChange={(e) => {
                        setEditEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      required
                    />
                    {emailError && (
                      <div className="invalid-feedback">{emailError}</div>
                    )}
                  </div>
                  <button type="submit" className="btn btn-primary w-100 btn-animated">
                    Сохранить
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          {/* Объявления пользователя */}
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Мои объявления</h5>
                
                <div className="list-group list-group-flush">
                  {userPets.map(pet => {
                    const status = statusConfig[pet.status];
                    const isDisabled = ['found', 'archive'].includes(pet.status);
                    
                    return (
                      <div 
                        className="list-group-item d-flex justify-content-between align-items-center" 
                        key={pet.id}
                      >
                        <div>
                          <h6>{pet.title}</h6>
                          <small className="text-muted">
                            Район: {pet.district} | Дата: {pet.date}
                          </small>
                        </div>
                        <div>
                          <span className={`badge badge-status ${status.className}`}>
                            {status.text}
                          </span>
                          <div className="btn-group btn-group-sm ms-2">
                            <button
                              className={`btn ${isDisabled ? 'btn-outline-secondary' : 'btn-outline-primary'} btn-animated`}
                              onClick={() => !isDisabled && handleEditPet(pet.id)}
                              disabled={isDisabled}
                            >
                              Редактировать
                            </button>
                            <button
                              className={`btn ${isDisabled ? 'btn-outline-secondary' : 'btn-outline-danger'} btn-animated`}
                              onClick={() => !isDisabled && handleDeletePet(pet.id)}
                              disabled={isDisabled}
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
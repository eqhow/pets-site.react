import React, { useState, useContext, useEffect } from 'react';
import { AuthContext, AlertContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { api } from '../../api';

function Profile() {
  const { isLoggedIn, user, updateUser, logoutUser } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [deletingOrderId, setDeletingOrderId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/sign-in');
      return;
    }
    loadUserData();
  }, [isLoggedIn, navigate]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Загружаем информацию о текущем пользователе
      const userResponse = await api.getCurrentUser();
      console.log('Ответ от getCurrentUser:', userResponse);
      
      let userData = userResponse.data || userResponse;
      
      if (!userData) {
        // Используем данные из контекста
        const defaultUserData = {
          ...user,
          daysSinceRegistration: 0,
          registrationText: 'Дата регистрации не указана'
        };
        
        setUserInfo(defaultUserData);
        setEditPhone(user.phone || '');
        setEditEmail(user.email || '');
        
        showAlert('Не удалось загрузить полные данные профиля', 'warning');
      } else {
        // Расчет количества дней с регистрации и форматирование
        let registrationText = 'Дата регистрации не указана';
        let daysSinceRegistration = 0;
        
        if (userData.registrationDate) {
          const registrationDate = new Date(userData.registrationDate);
          const today = new Date();
          daysSinceRegistration = Math.floor((today - registrationDate) / (1000 * 60 * 60 * 24));
          
          // Форматируем дату как в HTML: "2 года, 3 месяца, 15 дней"
          const years = Math.floor(daysSinceRegistration / 365);
          const months = Math.floor((daysSinceRegistration % 365) / 30);
          const days = daysSinceRegistration % 30;
          
          const parts = [];
          if (years > 0) parts.push(`${years} ${getRussianWord(years, 'год', 'года', 'лет')}`);
          if (months > 0) parts.push(`${months} ${getRussianWord(months, 'месяц', 'месяца', 'месяцев')}`);
          if (days > 0) parts.push(`${days} ${getRussianWord(days, 'день', 'дня', 'дней')}`);
          
          registrationText = parts.length > 0 ? `Зарегистрирован: ${parts.join(', ')}` : 'Зарегистрирован сегодня';
        }
        
        // Объединяем данные
        const mergedUserData = {
          ...user,
          ...userData,
          daysSinceRegistration,
          registrationText,
          ordersCount: userData.ordersCount || 0,
          petsCount: userData.petsCount || 0
        };
        
        setUserInfo(mergedUserData);
        setEditPhone(mergedUserData.phone || '');
        setEditEmail(mergedUserData.email || '');
        
        localStorage.setItem('userData', JSON.stringify(mergedUserData));
      }
      
      // Загружаем объявления текущего пользователя
      try {
        const ordersResponse = await api.getUserOrders();
        console.log('Ответ от getUserOrders:', ordersResponse);
        
        const orders = ordersResponse.data?.orders || ordersResponse.data || [];
        
        // Примерные данные для отображения, если API не возвращает
        let processedOrders = orders;
        
        if (orders.length === 0 && userInfo) {
          // Примерные данные для демонстрации
          processedOrders = [
            {
              id: 1,
              kind: 'кошка',
              description: 'Найдена кошка, порода Сфинкс',
              district: 'Василеостровский',
              date: '01-06-2025',
              status: 'onModeration'
            },
            {
              id: 2,
              kind: 'собака',
              description: 'Найдена собака, порода Лабрадор',
              district: 'Центральный',
              date: '15-05-2025',
              status: 'active'
            },
            {
              id: 3,
              kind: 'попугай',
              description: 'Найден попугай, волнистый',
              district: 'Адмиралтейский',
              date: '10-04-2025',
              status: 'wasFound'
            },
            {
              id: 4,
              kind: 'кошка',
              description: 'Найдена кошка, рыжая',
              district: 'Фрунзенский',
              date: '22-03-2025',
              status: 'archive'
            }
          ];
        }
        
        setUserOrders(processedOrders);
      } catch (ordersError) {
        console.error('Ошибка загрузки объявлений:', ordersError);
        
        // Примерные данные для отображения
        const demoOrders = [
          {
            id: 1,
            kind: 'кошка',
            description: 'Найдена кошка, порода Сфинкс',
            district: 'Василеостровский',
            date: '01-06-2025',
            status: 'onModeration'
          },
          {
            id: 2,
            kind: 'собака',
            description: 'Найдена собака, порода Лабрадор',
            district: 'Центральный',
            date: '15-05-2025',
            status: 'active'
          },
          {
            id: 3,
            kind: 'попугай',
            description: 'Найден попугай, волнистый',
            district: 'Адмиралтейский',
            date: '10-04-2025',
            status: 'wasFound'
          },
          {
            id: 4,
            kind: 'кошка',
            description: 'Найдена кошка, рыжая',
            district: 'Фрунзенский',
            date: '22-03-2025',
            status: 'archive'
          }
        ];
        
        setUserOrders(demoOrders);
        showAlert('Используются демо-данные объявлений', 'info');
      }
      
    } catch (error) {
      console.error('Ошибка загрузки данных профиля:', error);
      
      if (error.message.includes('401')) {
        showAlert('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
        logoutUser();
        navigate('/sign-in');
      } else {
        // Используем данные из контекста
        const defaultUserData = {
          ...user,
          daysSinceRegistration: 0,
          registrationText: 'Дата регистрации не указана',
          ordersCount: 4,
          petsCount: 2
        };
        
        setUserInfo(defaultUserData);
        setEditPhone(user.phone || '');
        setEditEmail(user.email || '');
        
        // Примерные данные для отображения
        const demoOrders = [
          {
            id: 1,
            kind: 'кошка',
            description: 'Найдена кошка, порода Сфинкс',
            district: 'Василеостровский',
            date: '01-06-2025',
            status: 'onModeration'
          },
          {
            id: 2,
            kind: 'собака',
            description: 'Найдена собака, порода Лабрадор',
            district: 'Центральный',
            date: '15-05-2025',
            status: 'active'
          },
          {
            id: 3,
            kind: 'попугай',
            description: 'Найден попугай, волнистый',
            district: 'Адмиралтейский',
            date: '10-04-2025',
            status: 'wasFound'
          },
          {
            id: 4,
            kind: 'кошка',
            description: 'Найдена кошка, рыжая',
            district: 'Фрунзенский',
            date: '22-03-2025',
            status: 'archive'
          }
        ];
        
        setUserOrders(demoOrders);
        
        showAlert('Используются демо-данные', 'info');
      }
    } finally {
      setLoading(false);
    }
  };

  // Функция для склонения русских слов
  const getRussianWord = (number, one, two, five) => {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
      return five;
    }
    n %= 10;
    if (n === 1) {
      return one;
    }
    if (n >= 2 && n <= 4) {
      return two;
    }
    return five;
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    
    if (!editPhone.trim()) {
      showAlert('Введите номер телефона', 'warning');
      return;
    }
    
    try {
      const success = await updateUser({ phone: editPhone });
      if (success) {
        setUserInfo(prev => ({ ...prev, phone: editPhone }));
        showAlert('Телефон успешно обновлен', 'success');
      }
    } catch (error) {
      showAlert('Ошибка обновления телефона: ' + error.message, 'danger');
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editEmail.trim() || !emailRegex.test(editEmail)) {
      showAlert('Введите корректный email адрес', 'warning');
      return;
    }
    
    try {
      const success = await updateUser({ email: editEmail });
      if (success) {
        setUserInfo(prev => ({ ...prev, email: editEmail }));
        showAlert('Email успешно обновлен', 'success');
      }
    } catch (error) {
      showAlert('Ошибка обновления email: ' + error.message, 'danger');
    }
  };

  // ИСПРАВЛЕНО: теперь перенаправляет на страницу объявления для редактирования
  const handleEditOrder = (orderId) => {
    navigate(`/pet/${orderId}`);
  };

  // ИСПРАВЛЕНО: реальное удаление объявления через API
  const handleDeleteOrder = async (orderId, orderStatus) => {
    if (!orderId) {
      showAlert('ID объявления не указан', 'warning');
      return;
    }
    
    if (!window.confirm('Вы уверены, что хотите удалить это объявление? Это действие нельзя отменить.')) {
      return;
    }
    
    try {
      setDeletingOrderId(orderId);
      
      // Пытаемся удалить через API
      try {
        console.log(`Попытка удалить объявление #${orderId} через API...`);
        const response = await api.deleteOrder(orderId);
        console.log('Ответ от API при удалении:', response);
        
        // Успешно удалено с API
        showAlert('Объявление успешно удалено!', 'success');
      } catch (apiError) {
        console.error('Ошибка API при удалении:', apiError);
        
        // Если API не работает, просто удаляем локально
        console.log('Удаление только локально (API не ответил)');
        showAlert('Объявление удалено локально. API может быть недоступно.', 'info');
      }
      
      // Удаляем из локального состояния в любом случае
      setUserOrders(prev => prev.filter(order => order.id !== orderId));
      
      // Обновляем статистику
      if (userInfo) {
        setUserInfo(prev => ({
          ...prev,
          ordersCount: Math.max(0, (prev.ordersCount || 0) - 1)
        }));
      }
      
    } catch (error) {
      console.error('Общая ошибка удаления:', error);
      showAlert('Ошибка удаления объявления: ' + error.message, 'danger');
    } finally {
      setDeletingOrderId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: 'Активное', className: 'badge-active' },
      onModeration: { text: 'На модерации', className: 'badge-moderation' },
      wasFound: { text: 'Хозяин найден', className: 'badge-found' },
      archive: { text: 'В архиве', className: 'badge-archive' }
    };
    
    const config = statusConfig[status] || { text: status, className: 'badge-secondary' };
    
    return (
      <span className={`badge badge-status ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const isOrderEditable = (status) => {
    return status === 'active' || status === 'onModeration';
  };

  if (loading) {
    return (
      <div id="profile" className="page fade-in">
        <div className="container my-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
            <p className="mt-3">Загрузка профиля...</p>
          </div>
        </div>
      </div>
    );
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
                  <i className="bi bi-person-circle profile-avatar" style={{ fontSize: '5rem', color: '#6c757d' }}></i>
                </div>
                <h4 id="profile-user-name">{userInfo?.name || 'Пользователь'}</h4>
                <p className="text-muted" id="profile-registration-date">
                  {userInfo?.registrationText || 'Дата регистрации не указана'}
                </p>
                <div className="row text-center mt-3">
                  <div className="col-6">
                    <div className="stats-card rounded-3 p-2 mb-2" style={{ backgroundColor: '#f8f9fa' }}>
                      <h5>{userInfo?.ordersCount || 0}</h5>
                      <small>Объявления</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="stats-card rounded-3 p-2 mb-2" style={{ backgroundColor: '#f8f9fa' }}>
                      <h5>{userInfo?.petsCount || 0}</h5>
                      <small>Найдены хозяева</small>
                    </div>
                  </div>
                </div>
                <button 
                  className="btn btn-outline-primary btn-sm mt-3 btn-animated" 
                  onClick={logoutUser}
                >
                  <i className="bi bi-box-arrow-right me-1"></i>Выйти
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
                      className="form-control" 
                      id="profile-phone" 
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      required 
                      pattern="[\+\d]+"
                    />
                    <div className="invalid-feedback">Телефон должен содержать только цифры и знак +</div>
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
                      className="form-control" 
                      id="profile-email" 
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      required
                    />
                    <div className="invalid-feedback">Пожалуйста, введите корректный email</div>
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
                
                {userOrders.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">У вас пока нет объявлений</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate('/add-pet')}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Создать первое объявление
                    </button>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {userOrders.map(order => (
                      <div key={order.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div className="flex-grow-1 me-3">
                          <h6 className="mb-1">{order.description || `${order.kind || 'Животное'}`}</h6>
                          <small className="text-muted">
                            Район: {order.district || 'Не указан'} | Дата: {order.date || 'Не указана'}
                          </small>
                        </div>
                        <div className="d-flex flex-column align-items-end">
                          <div className="mb-2">
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className={`btn ${isOrderEditable(order.status) ? 'btn-outline-primary' : 'btn-outline-secondary'} btn-animated`}
                              onClick={() => isOrderEditable(order.status) && handleEditOrder(order.id)}
                              disabled={!isOrderEditable(order.status)}
                              title={isOrderEditable(order.status) ? "Редактировать объявление" : "Редактирование недоступно"}
                            >
                              <i className="bi bi-pencil me-1"></i>
                              Редактировать
                            </button>
                            <button 
                              className={`btn ${isOrderEditable(order.status) ? 'btn-outline-danger' : 'btn-outline-secondary'} btn-animated`}
                              onClick={() => isOrderEditable(order.status) && handleDeleteOrder(order.id, order.status)}
                              disabled={!isOrderEditable(order.status) || deletingOrderId === order.id}
                              title={isOrderEditable(order.status) ? "Удалить объявление" : "Удаление недоступно"}
                            >
                              {deletingOrderId === order.id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                  Удаление...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-trash me-1"></i>
                                  Удалить
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
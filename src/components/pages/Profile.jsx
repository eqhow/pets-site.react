import React, { useState, useContext, useEffect } from 'react';
import { AuthContext, AlertContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { api, getImageUrl } from '../../api';

function Profile() {
  const { isLoggedIn, user, updateUser } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [editValues, setEditValues] = useState({});
  const [uploadingImages, setUploadingImages] = useState({});

  // Проверка авторизации и загрузка данных
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/sign-in');
      return;
    }
    loadUserData();
  }, [isLoggedIn, navigate]);

  // Загрузка данных пользователя
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // 1. Загружаем информацию о текущем пользователе
      const userResponse = await api.getCurrentUser();
      const userData = userResponse.data;
      
      // Расчет количества дней с регистрации
      const registrationDate = new Date(userData.registrationDate);
      const today = new Date();
      const daysSinceRegistration = Math.floor((today - registrationDate) / (1000 * 60 * 60 * 24));
      
      setUserInfo({
        ...userData,
        daysSinceRegistration
      });
      
      // 2. Загружаем объявления текущего пользователя
      const ordersResponse = await api.getUserOrders();
      const orders = ordersResponse.data?.orders || ordersResponse.data || [];
      
      // Обрабатываем изображения в объявлениях
      const processedOrders = orders.map(order => {
        const processed = { ...order };
        
        // Обработка основного изображения
        if (order.image) {
          processed.image = getImageUrl(order.image);
        }
        
        // Обработка массива фотографий
        processed.photos = [];
        if (order.photos) {
          if (Array.isArray(order.photos)) {
            processed.photos = order.photos
              .filter(photo => photo && typeof photo === 'string')
              .map(photo => getImageUrl(photo));
          } else if (typeof order.photos === 'string') {
            const photoStrings = order.photos.split(',').map(str => str.trim());
            processed.photos = photoStrings
              .filter(str => str && !/^\d+$/.test(str))
              .map(str => getImageUrl(str));
          }
        }
        
        return processed;
      });
      
      setUserOrders(processedOrders);
      
    } catch (error) {
      console.error('Ошибка загрузки данных профиля:', error);
      showAlert('Ошибка загрузки профиля: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменения телефона
  const handlePhoneChange = async () => {
    const newPhone = editValues.phone?.trim();
    
    if (!newPhone) {
      showAlert('Введите номер телефона', 'warning');
      return;
    }
    
    if (newPhone === userInfo?.phone) {
      setEditMode(prev => ({ ...prev, phone: false }));
      return;
    }
    
    try {
      await api.updatePhone(newPhone);
      
      // Обновляем локальное состояние
      const updatedUserInfo = { ...userInfo, phone: newPhone };
      setUserInfo(updatedUserInfo);
      
      // Обновляем данные в контексте
      const updatedUser = { ...user, phone: newPhone };
      updateUser({ phone: newPhone });
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      showAlert('Номер телефона успешно обновлен', 'success');
      setEditMode(prev => ({ ...prev, phone: false }));
    } catch (error) {
      showAlert('Ошибка обновления телефона: ' + error.message, 'danger');
    }
  };

  // Обработчик изменения email
  const handleEmailChange = async () => {
    const newEmail = editValues.email?.trim();
    
    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegex.test(newEmail)) {
      showAlert('Введите корректный email адрес', 'warning');
      return;
    }
    
    if (newEmail === userInfo?.email) {
      setEditMode(prev => ({ ...prev, email: false }));
      return;
    }
    
    try {
      await api.updateEmail(newEmail);
      
      // Обновляем локальное состояние
      const updatedUserInfo = { ...userInfo, email: newEmail };
      setUserInfo(updatedUserInfo);
      
      // Обновляем данные в контексте
      const updatedUser = { ...user, email: newEmail };
      updateUser({ email: newEmail });
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      showAlert('Email успешно обновлен', 'success');
      setEditMode(prev => ({ ...prev, email: false }));
    } catch (error) {
      showAlert('Ошибка обновления email: ' + error.message, 'danger');
    }
  };

  // Обработчик удаления объявления
  const handleDeleteOrder = async (orderId, orderStatus) => {
    // Проверяем можно ли удалять
    if (orderStatus !== 'active' && orderStatus !== 'onModeration') {
      showAlert('Можно удалять только активные объявления или на модерации', 'warning');
      return;
    }
    
    if (!window.confirm('Вы уверены, что хотите удалить это объявление?')) {
      return;
    }
    
    try {
      await api.deleteOrder(orderId);
      
      // Удаляем из локального состояния
      setUserOrders(prev => prev.filter(order => order.id !== orderId));
      
      // Обновляем статистику
      if (userInfo) {
        setUserInfo(prev => ({
          ...prev,
          ordersCount: Math.max(0, (prev.ordersCount || 0) - 1)
        }));
      }
      
      showAlert('Объявление успешно удалено', 'success');
    } catch (error) {
      showAlert('Ошибка удаления объявления: ' + error.message, 'danger');
    }
  };

  // Обработчик начала редактирования объявления
  const startEditOrder = (order) => {
    if (order.status !== 'active' && order.status !== 'onModeration') {
      showAlert('Можно редактировать только активные объявления или на модерации', 'warning');
      return;
    }
    
    setEditMode(prev => ({ ...prev, [order.id]: true }));
    setEditValues(prev => ({
      ...prev,
      [order.id]: {
        mark: order.mark || '',
        description: order.description || '',
        photo1: null,
        photo2: null,
        photo3: null
      }
    }));
  };

  // Обработчик загрузки изображений
  const handleImageUpload = (orderId, field, file) => {
    if (!file) return;
    
    // Проверяем тип файла
    if (!file.type.includes('png')) {
      showAlert('Загружайте только PNG изображения', 'warning');
      return;
    }
    
    // Проверяем размер файла (например, максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAlert('Размер файла не должен превышать 5MB', 'warning');
      return;
    }
    
    setUploadingImages(prev => ({ 
      ...prev, 
      [orderId]: { 
        ...prev[orderId], 
        [field]: true 
      } 
    }));
    
    // Сохраняем файл в состоянии
    setEditValues(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: file
      }
    }));
    
    // Завершаем загрузку
    setTimeout(() => {
      setUploadingImages(prev => ({ 
        ...prev, 
        [orderId]: { 
          ...prev[orderId], 
          [field]: false 
        } 
      }));
      showAlert(`Изображение ${field} готово к загрузке`, 'success');
    }, 500);
  };

  // Обработчик сохранения изменений объявления
  const handleSaveOrder = async (orderId) => {
    const orderData = editValues[orderId];
    
    if (!orderData) return;
    
    try {
      const formData = new FormData();
      
      // Добавляем поля для редактирования
      if (orderData.mark !== undefined) formData.append('mark', orderData.mark);
      if (orderData.description !== undefined) formData.append('description', orderData.description);
      
      // Добавляем изображения
      if (orderData.photo1 instanceof File) {
        formData.append('photo1', orderData.photo1);
      }
      if (orderData.photo2 instanceof File) {
        formData.append('photo2', orderData.photo2);
      }
      if (orderData.photo3 instanceof File) {
        formData.append('photo3', orderData.photo3);
      }
      
      await api.updatePet(orderId, formData);
      
      // Обновляем локальное состояние
      const updatedOrders = userOrders.map(order => {
        if (order.id === orderId) {
          const updated = { ...order };
          
          // Обновляем текстовые поля
          if (orderData.mark !== undefined) updated.mark = orderData.mark;
          if (orderData.description !== undefined) updated.description = orderData.description;
          
          // Здесь в реальном приложении нужно обновить изображения после ответа от сервера
          // Для примела просто отмечаем, что объявление было обновлено
          updated.updated = true;
          
          return updated;
        }
        return order;
      });
      
      setUserOrders(updatedOrders);
      setEditMode(prev => ({ ...prev, [orderId]: false }));
      setEditValues(prev => {
        const newValues = { ...prev };
        delete newValues[orderId];
        return newValues;
      });
      
      showAlert('Объявление успешно обновлено', 'success');
      
      // Перезагружаем данные для получения актуальных изображений
      setTimeout(() => {
        loadUserData();
      }, 500);
      
    } catch (error) {
      showAlert('Ошибка обновления объявления: ' + error.message, 'danger');
    }
  };

  // Обработчик отмены редактирования
  const cancelEditOrder = (orderId) => {
    setEditMode(prev => ({ ...prev, [orderId]: false }));
    setEditValues(prev => {
      const newValues = { ...prev };
      delete newValues[orderId];
      return newValues;
    });
  };

  // Обработчик изменения полей редактирования
  const handleEditChange = (orderId, field, value) => {
    setEditValues(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value
      }
    }));
  };

  // Обработчик просмотра объявления
  const handleViewOrder = (orderId) => {
    navigate(`/pet/${orderId}`);
  };

  if (loading) {
    return (
      <div className="page fade-in">
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

  // Группировка объявлений по статусу
  const groupedOrders = {
    active: userOrders.filter(order => order.status === 'active'),
    onModeration: userOrders.filter(order => order.status === 'onModeration'),
    wasFound: userOrders.filter(order => order.status === 'wasFound'),
    archive: userOrders.filter(order => order.status === 'archive')
  };

  const statusLabels = {
    active: 'Активные',
    onModeration: 'На модерации',
    wasFound: 'Хозяин найден',
    archive: 'В архиве'
  };

  const statusColors = {
    active: 'bg-success',
    onModeration: 'bg-warning',
    wasFound: 'bg-info',
    archive: 'bg-secondary'
  };

  return (
    <div id="profile" className="page fade-in">
      <div className="container my-5">
        <h2 className="section-title">Профиль пользователя</h2>
        
        {/* Информация о пользователе */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-3 text-center">
                <div className="profile-avatar mb-3">
                  <i className="bi bi-person-circle"></i>
                </div>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => navigate('/add-pet')}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  Новое объявление
                </button>
              </div>
              <div className="col-md-9">
                <h4>{userInfo?.name || 'Пользователь'}</h4>
                <div className="row mt-3">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <strong>Телефон:</strong>
                      {editMode.phone ? (
                        <div className="input-group mt-1">
                          <input
                            type="tel"
                            className="form-control"
                            value={editValues.phone || userInfo?.phone || ''}
                            onChange={(e) => setEditValues(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Введите номер телефона"
                          />
                          <button
                            className="btn btn-success"
                            onClick={handlePhoneChange}
                            title="Сохранить"
                          >
                            <i className="bi bi-check"></i>
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => setEditMode(prev => ({ ...prev, phone: false }))}
                            title="Отмена"
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex align-items-center">
                          <span className="ms-2">{userInfo?.phone || 'Не указан'}</span>
                          <button
                            className="btn btn-sm btn-outline-primary ms-2"
                            onClick={() => setEditMode(prev => ({ ...prev, phone: true }))}
                            title="Изменить телефон"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <strong>Email:</strong>
                      {editMode.email ? (
                        <div className="input-group mt-1">
                          <input
                            type="email"
                            className="form-control"
                            value={editValues.email || userInfo?.email || ''}
                            onChange={(e) => setEditValues(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Введите email"
                          />
                          <button
                            className="btn btn-success"
                            onClick={handleEmailChange}
                            title="Сохранить"
                          >
                            <i className="bi bi-check"></i>
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => setEditMode(prev => ({ ...prev, email: false }))}
                            title="Отмена"
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex align-items-center">
                          <span className="ms-2">{userInfo?.email || 'Не указан'}</span>
                          <button
                            className="btn btn-sm btn-outline-primary ms-2"
                            onClick={() => setEditMode(prev => ({ ...prev, email: true }))}
                            title="Изменить email"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <strong>Дата регистрации:</strong>
                      <span className="ms-2">
                        {userInfo?.registrationDate ? new Date(userInfo.registrationDate).toLocaleDateString('ru-RU') : 'Не указана'}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <strong>На сайте:</strong>
                      <span className="ms-2">
                        {userInfo?.daysSinceRegistration || 0} дней
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <strong>ID пользователя:</strong>
                      <span className="ms-2 text-muted">
                        {userInfo?.id || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Статистика */}
                <div className="row mt-4">
                  <div className="col-md-4 mb-3">
                    <div className="stats-card p-3 rounded text-center">
                      <h5 className="text-white mb-2">Объявления</h5>
                      <h2 className="text-white mb-0">{userInfo?.ordersCount || 0}</h2>
                      <small className="text-white opacity-75">Всего создано</small>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="stats-card p-3 rounded text-center">
                      <h5 className="text-white mb-2">Найдено хозяев</h5>
                      <h2 className="text-white mb-0">{userInfo?.petsCount || 0}</h2>
                      <small className="text-white opacity-75">Успешно завершено</small>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="stats-card p-3 rounded text-center">
                      <h5 className="text-white mb-2">Активных</h5>
                      <h2 className="text-white mb-0">{groupedOrders.active.length || 0}</h2>
                      <small className="text-white opacity-75">Текущие объявления</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Объявления пользователя */}
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="card-title mb-0">Мои объявления</h4>
              <div className="text-muted">
                Всего: {userOrders.length}
              </div>
            </div>
            
            {userOrders.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox display-1 text-muted mb-3"></i>
                <h5 className="text-muted mb-3">У вас пока нет объявлений</h5>
                <p className="text-muted mb-4">Создайте первое объявление о найденном животном</p>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate('/add-pet')}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Добавить объявление
                </button>
              </div>
            ) : (
              <div>
                {/* Группировка по статусам */}
                {Object.entries(groupedOrders).map(([status, orders]) => {
                  if (orders.length === 0) return null;
                  
                  return (
                    <div key={status} className="mb-5">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">
                          {statusLabels[status]} ({orders.length})
                        </h5>
                        <span className={`badge ${statusColors[status]}`}>
                          {statusLabels[status]}
                        </span>
                      </div>
                      
                      <div className="table-responsive">
                        <table className="table table-hover table-striped">
                          <thead className="table-dark">
                            <tr>
                              <th style={{ width: '100px' }}>Фото</th>
                              <th>Информация</th>
                              <th style={{ width: '120px' }}>Статус</th>
                              <th style={{ width: '180px' }}>Действия</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map(order => {
                              const isEditing = editMode[order.id];
                              const orderEditValues = editValues[order.id] || {};
                              const isUploading = uploadingImages[order.id];
                              
                              return (
                                <tr key={order.id}>
                                  <td>
                                    {isEditing ? (
                                      <div>
                                        <div className="mb-2">
                                          <small className="d-block mb-1 text-muted">Основное фото:</small>
                                          <input
                                            type="file"
                                            className="form-control form-control-sm"
                                            accept=".png"
                                            onChange={(e) => handleImageUpload(order.id, 'photo1', e.target.files[0])}
                                            disabled={isUploading?.photo1}
                                          />
                                          {isUploading?.photo1 && (
                                            <small className="text-muted"><i className="bi bi-hourglass-split me-1"></i>Загрузка...</small>
                                          )}
                                        </div>
                                        <div className="mb-2">
                                          <small className="d-block mb-1 text-muted">Доп. фото 2:</small>
                                          <input
                                            type="file"
                                            className="form-control form-control-sm"
                                            accept=".png"
                                            onChange={(e) => handleImageUpload(order.id, 'photo2', e.target.files[0])}
                                            disabled={isUploading?.photo2}
                                          />
                                        </div>
                                        <div>
                                          <small className="d-block mb-1 text-muted">Доп. фото 3:</small>
                                          <input
                                            type="file"
                                            className="form-control form-control-sm"
                                            accept=".png"
                                            onChange={(e) => handleImageUpload(order.id, 'photo3', e.target.files[0])}
                                            disabled={isUploading?.photo3}
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="position-relative">
                                        <img
                                          src={order.image || 'https://via.placeholder.com/80x80?text=Нет+фото'}
                                          alt={order.kind}
                                          className="img-fluid rounded border"
                                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                          onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/80x80?text=Нет+фото';
                                          }}
                                        />
                                        {order.photos && order.photos.length > 0 && (
                                          <span className="position-absolute top-0 start-100 translate-middle badge bg-secondary rounded-pill">
                                            +{order.photos.length}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  
                                  <td>
                                    {isEditing ? (
                                      <div>
                                        <div className="mb-2">
                                          <small className="d-block mb-1 text-muted">Клеймо/Чип:</small>
                                          <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            value={orderEditValues.mark || ''}
                                            onChange={(e) => handleEditChange(order.id, 'mark', e.target.value)}
                                            placeholder="Введите клеймо или номер чипа"
                                          />
                                        </div>
                                        <div>
                                          <small className="d-block mb-1 text-muted">Описание:</small>
                                          <textarea
                                            className="form-control form-control-sm"
                                            rows="2"
                                            value={orderEditValues.description || ''}
                                            onChange={(e) => handleEditChange(order.id, 'description', e.target.value)}
                                            placeholder="Дополнительная информация о животном"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <h6 className="mb-1">{order.kind}</h6>
                                        <p className="mb-1 small text-muted">{order.description || 'Без описания'}</p>
                                        <div className="small text-muted">
                                          <div><i className="bi bi-geo-alt me-1"></i>Район: {order.district || 'Не указан'}</div>
                                          <div><i className="bi bi-tag me-1"></i>Клеймо: {order.mark || 'Не указано'}</div>
                                          <div><i className="bi bi-calendar me-1"></i>Дата: {order.date || 'Не указана'}</div>
                                        </div>
                                      </div>
                                    )}
                                  </td>
                                  
                                  <td>
                                    <span className={`badge ${statusColors[order.status] || 'bg-secondary'}`}>
                                      {order.status === 'active' ? 'Активное' :
                                       order.status === 'onModeration' ? 'На модерации' :
                                       order.status === 'wasFound' ? 'Хозяин найден' :
                                       order.status === 'archive' ? 'В архиве' :
                                       order.status || 'Неизвестно'}
                                    </span>
                                  </td>
                                  
                                  <td>
                                    {isEditing ? (
                                      <div className="d-flex flex-column gap-1">
                                        <button
                                          className="btn btn-sm btn-success"
                                          onClick={() => handleSaveOrder(order.id)}
                                          disabled={uploadingImages[order.id]?.photo1}
                                        >
                                          <i className="bi bi-check me-1"></i> Сохранить
                                        </button>
                                        <button
                                          className="btn btn-sm btn-secondary"
                                          onClick={() => cancelEditOrder(order.id)}
                                        >
                                          <i className="bi bi-x me-1"></i> Отмена
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="d-flex flex-column gap-1">
                                        <button
                                          className="btn btn-sm btn-outline-primary"
                                          onClick={() => handleViewOrder(order.id)}
                                          title="Просмотреть объявление"
                                        >
                                          <i className="bi bi-eye me-1"></i> Просмотр
                                        </button>
                                        
                                        {(order.status === 'active' || order.status === 'onModeration') && (
                                          <>
                                            <button
                                              className="btn btn-sm btn-outline-warning"
                                              onClick={() => startEditOrder(order)}
                                              title="Редактировать объявление"
                                            >
                                              <i className="bi bi-pencil me-1"></i> Редактировать
                                            </button>
                                            <button
                                              className="btn btn-sm btn-outline-danger"
                                              onClick={() => handleDeleteOrder(order.id, order.status)}
                                              title="Удалить объявление"
                                            >
                                              <i className="bi bi-trash me-1"></i> Удалить
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
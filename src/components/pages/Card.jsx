import React, { useState, useContext, useEffect } from 'react';
import { AuthContext, AlertContext } from '../../App';
import { useParams, useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { api, getImageUrl } from '../../api';

function Card() {
  const { id } = useParams();
  const { isLoggedIn, user } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const [pet, setPet] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    description: '',
    district: '',
    kind: '',
    mark: '',
  });
  const [editPhotos, setEditPhotos] = useState({
    photo1: null,
    photo2: null,
    photo3: null,
  });
  const [filePreviews, setFilePreviews] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // Загрузка данных животного
  useEffect(() => {
    loadPet();
  }, [id]);

  const loadPet = async () => {
    try {
      setLoading(true);
      const response = await api.getPet(id);
      console.log('Pet data:', response);
      
      // Обрабатываем разные форматы ответа
      let petData = null;
      
      if (response.data?.pet?.[0]) {
        petData = response.data.pet[0];
      } else if (response.data?.pet) {
        petData = response.data.pet;
      } else if (response.data?.order) {
        petData = response.data.order;
      } else if (response.data) {
        petData = response.data;
      } else {
        petData = response;
      }
      
      // Обрабатываем изображения
      const processedPet = {
        ...petData,
        image: getImageUrl(petData.image),
        photos: petData.photos?.map(photo => getImageUrl(photo)) || []
      };
      
      setPet(processedPet);
      
      // Заполняем форму редактирования (БЕЗ СТАТУСА)
      setEditForm({
        description: processedPet.description || '',
        district: processedPet.district || '',
        kind: processedPet.kind || '',
        mark: processedPet.mark || '',
      });
      
      // Проверяем, является ли текущий пользователь владельцем
      if (isLoggedIn && user && petData) {
        // Проверяем по user_id или по email/phone
        const isPetOwner = (
          (petData.user_id && petData.user_id === user.id) ||
          (petData.email && petData.email === user.email) ||
          (petData.phone && petData.phone === user.phone)
        );
        setIsOwner(isPetOwner);
      }
      
    } catch (error) {
      console.error('Ошибка загрузки животного:', error);
      showAlert('Животное не найдено или произошла ошибка', 'danger');
      setTimeout(() => navigate('/'), 2000);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик контакта
  const handleContact = (method) => {
    if (!isLoggedIn) {
      navigate('/sign-in');
      return;
    }
    
    if (!pet) return;
    
    if (method === 'call') {
      window.location.href = `tel:${pet.phone || '+79112345678'}`;
    } else if (method === 'email') {
      window.location.href = `mailto:${pet.email || 'user@user.ru'}`;
    }
  };

  // Редактирование объявления
  const handleEdit = () => {
    setEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработчик загрузки фото для редактирования
  const handlePhotoChange = (e) => {
    const { id, files } = e.target;
    const file = files[0];
    
    if (file) {
      // Проверяем формат файла (только PNG)
      if (!file.type.includes('png')) {
        showAlert('Пожалуйста, загружайте только PNG изображения', 'warning');
        e.target.value = '';
        return;
      }
      
      // Проверяем размер файла
      if (file.size > 5 * 1024 * 1024) {
        showAlert('Размер файла не должен превышать 5MB', 'warning');
        e.target.value = '';
        return;
      }
      
      // Создаем превью
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreviews(prev => ({
          ...prev,
          [id]: event.target.result
        }));
      };
      reader.readAsDataURL(file);
      
      setEditPhotos(prev => ({
        ...prev,
        [id]: file
      }));
    } else {
      // Удаляем превью
      setFilePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[id];
        return newPreviews;
      });
      
      setEditPhotos(prev => ({
        ...prev,
        [id]: null
      }));
    }
  };

  const handleSaveEdit = async () => {
    if (!pet || !isOwner) return;
    
    try {
      setEditLoading(true);
      
      const formData = new FormData();
      formData.append('description', editForm.description);
      formData.append('district', editForm.district);
      formData.append('kind', editForm.kind);
      formData.append('mark', editForm.mark);
      
      // Добавляем новые фото если они есть
      if (editPhotos.photo1) {
        formData.append('photo1', editPhotos.photo1);
      }
      if (editPhotos.photo2) {
        formData.append('photo2', editPhotos.photo2);
      }
      if (editPhotos.photo3) {
        formData.append('photo3', editPhotos.photo3);
      }
      
      console.log('Отправка редактирования:', {
        description: editForm.description,
        district: editForm.district,
        kind: editForm.kind,
        mark: editForm.mark,
        hasPhoto1: !!editPhotos.photo1,
        hasPhoto2: !!editPhotos.photo2,
        hasPhoto3: !!editPhotos.photo3
      });
      
      const response = await api.updatePet(pet.id, formData);
      console.log('Ответ редактирования:', response);
      
      // Очищаем превью и загруженные файлы
      setFilePreviews({});
      setEditPhotos({
        photo1: null,
        photo2: null,
        photo3: null,
      });
      
      // Обновляем данные
      await loadPet();
      setEditing(false);
      showAlert('Объявление успешно обновлено!', 'success');
      
    } catch (error) {
      console.error('Ошибка редактирования:', error);
      showAlert('Ошибка обновления объявления: ' + error.message, 'danger');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    // Очищаем загруженные фото
    setFilePreviews({});
    setEditPhotos({
      photo1: null,
      photo2: null,
      photo3: null,
    });
    
    // Восстанавливаем исходные значения (БЕЗ СТАТУСА)
    if (pet) {
      setEditForm({
        description: pet.description || '',
        district: pet.district || '',
        kind: pet.kind || '',
        mark: pet.mark || ''
      });
    }
  };

  // Удаление объявления
  const handleDelete = async () => {
    if (!pet || !isOwner) return;
    
    if (!window.confirm('Вы уверены, что хотите удалить это объявление? Это действие нельзя отменить.')) {
      return;
    }
    
    try {
      setLoading(true);
      await api.deleteOrder(pet.id);
      showAlert('Объявление успешно удалено!', 'success');
      setTimeout(() => navigate('/profile'), 1000);
    } catch (error) {
      console.error('Ошибка удаления:', error);
      showAlert('Ошибка удаления объявления: ' + error.message, 'danger');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page fade-in">
        <div className="container my-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="page fade-in">
        <div className="container my-5">
          <div className="text-center">
            <h3>Животное не найдено</h3>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  const photos = pet.photos && pet.photos.length > 0 
    ? pet.photos 
    : pet.image 
      ? [pet.image] 
      : ['https://via.placeholder.com/600x400?text=Нет+фото'];

  const hasMultiplePhotos = photos.length > 1;

  // Функция для отображения статуса (только для превью)
  const getStatusBadge = (status) => {
    switch(status) {
      case 'onModeration':
        return <span className="badge bg-warning">На модерации</span>;
      case 'active':
        return <span className="badge bg-success">Активное</span>;
      case 'wasFound':
        return <span className="badge bg-info">Хозяин найден</span>;
      case 'archive':
        return <span className="badge bg-secondary">В архиве</span>;
      default:
        return null;
    }
  };

  return (
    <div id="pet-card" className="page fade-in">
      <div className="container my-5">
        {/* Кнопки управления для владельца */}
        {isOwner && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Управление объявлением</h5>
                  <div className="d-flex gap-2 flex-wrap">
                    {!editing ? (
                      <>
                        <button 
                          className="btn btn-primary"
                          onClick={handleEdit}
                        >
                          <i className="bi bi-pencil me-2"></i>
                          Редактировать
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={handleDelete}
                          disabled={loading}
                        >
                          <i className="bi bi-trash me-2"></i>
                          Удалить
                        </button>
                        <Link to="/profile" className="btn btn-outline-secondary">
                          <i className="bi bi-arrow-left me-2"></i>
                          К моим объявлениям
                        </Link>
                      </>
                    ) : (
                      <>
                        <button 
                          className="btn btn-success"
                          onClick={handleSaveEdit}
                          disabled={editLoading}
                        >
                          {editLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Сохранение...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check me-2"></i>
                              Сохранить
                            </>
                          )}
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={handleCancelEdit}
                          disabled={editLoading}
                        >
                          <i className="bi bi-x me-2"></i>
                          Отмена
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="row">
          <div className="col-lg-8">
            {/* Фотографии животного */}
            {photos.length > 0 && (
              <div
                id="petCarousel"
                className={`carousel slide mb-4 ${hasMultiplePhotos ? '' : 'carousel-fixed'}`}
                data-bs-ride="carousel"
              >
                {hasMultiplePhotos && (
                  <div className="carousel-indicators">
                    {photos.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        data-bs-target="#petCarousel"
                        data-bs-slide-to={index}
                        className={index === 0 ? "active" : ""}
                        aria-label={`Слайд ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
                
                <div className="carousel-inner rounded-3">
                  {photos.map((photo, index) => (
                    <div key={index} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                      <img
                        src={photo}
                        className="d-block w-100"
                        alt={`${pet.kind} фото ${index + 1}`}
                        style={{ height: 400, objectFit: "cover" }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/600x400?text=Нет+фото';
                        }}
                      />
                    </div>
                  ))}
                </div>
                
                {hasMultiplePhotos && (
                  <>
                    <button
                      className="carousel-control-prev"
                      type="button"
                      data-bs-target="#petCarousel"
                      data-bs-slide="prev"
                    >
                      <span className="carousel-control-prev-icon" />
                      <span className="visually-hidden">Предыдущий</span>
                    </button>
                    <button
                      className="carousel-control-next"
                      type="button"
                      data-bs-target="#petCarousel"
                      data-bs-slide="next"
                    >
                      <span className="carousel-control-next-icon" />
                      <span className="visually-hidden">Следующий</span>
                    </button>
                  </>
                )}
              </div>
            )}
            
            {/* Описание животного - редактируемое или только для просмотра */}
            <div className="card">
              <div className="card-body">
                {editing ? (
                  // Форма редактирования (С ФОТОГРАФИЯМИ)
                  <>
                    <div className="mb-3">
                      <label htmlFor="kind" className="form-label">
                        <strong>Вид животного *</strong>
                      </label>
                      <select 
                        className="form-select" 
                        id="kind" 
                        name="kind"
                        value={editForm.kind}
                        onChange={handleEditChange}
                        required
                      >
                        <option value="">Выберите вид</option>
                        <option value="Собака">Собака</option>
                        <option value="Кошка">Кошка</option>
                        <option value="Птица">Птица</option>
                        <option value="Грызун">Грызун</option>
                        <option value="Рептилия">Рептилия</option>
                        <option value="Другое">Другое</option>
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="district" className="form-label">
                        <strong>Район *</strong>
                      </label>
                      <select 
                        className="form-select" 
                        id="district" 
                        name="district"
                        value={editForm.district}
                        onChange={handleEditChange}
                        required
                      >
                        <option value="">Выберите район</option>
                        <option value="Адмиралтейский">Адмиралтейский</option>
                        <option value="Василеостровский">Василеостровский</option>
                        <option value="Выборгский">Выборгский</option>
                        <option value="Калининский">Калининский</option>
                        <option value="Кировский">Кировский</option>
                        <option value="Колпинский">Колпинский</option>
                        <option value="Красногвардейский">Красногвардейский</option>
                        <option value="Красносельский">Красносельский</option>
                        <option value="Кронштадтский">Кронштадтский</option>
                        <option value="Курортный">Курортный</option>
                        <option value="Московский">Московский</option>
                        <option value="Невский">Невский</option>
                        <option value="Петроградский">Петроградский</option>
                        <option value="Петродворцовый">Петродворцовый</option>
                        <option value="Приморский">Приморский</option>
                        <option value="Пушкинский">Пушкинский</option>
                        <option value="Фрунзенский">Фрунзенский</option>
                        <option value="Центральный">Центральный</option>
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="mark" className="form-label">
                        <strong>Клеймо/Чип</strong>
                      </label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="mark" 
                        name="mark"
                        value={editForm.mark}
                        onChange={handleEditChange}
                        placeholder="Например: VL-0214"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">
                        <strong>Описание *</strong>
                      </label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        rows={5}
                        value={editForm.description}
                        onChange={handleEditChange}
                        required
                        placeholder="Опишите животное..."
                      />
                    </div>
                    
                    {/* Секция загрузки фотографий для редактирования */}
                    <div className="mb-3">
                      <label className="form-label">
                        <strong>Добавить/изменить фотографии</strong>
                      </label>
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        Вы можете загрузить новые фотографии. Они заменят текущие. Максимум 5MB, формат PNG.
                      </div>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label htmlFor="photo1" className="form-label">
                            Фото 1
                          </label>
                          <input
                            className="form-control"
                            type="file"
                            id="photo1"
                            accept="image/png"
                            onChange={handlePhotoChange}
                          />
                          {filePreviews.photo1 && (
                            <div className="mt-2">
                              <img 
                                src={filePreviews.photo1} 
                                alt="Превью" 
                                className="img-thumbnail" 
                                style={{ maxWidth: '100px', maxHeight: '100px' }}
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="col-md-4">
                          <label htmlFor="photo2" className="form-label">
                            Фото 2
                          </label>
                          <input
                            className="form-control"
                            type="file"
                            id="photo2"
                            accept="image/png"
                            onChange={handlePhotoChange}
                          />
                          {filePreviews.photo2 && (
                            <div className="mt-2">
                              <img 
                                src={filePreviews.photo2} 
                                alt="Превью" 
                                className="img-thumbnail" 
                                style={{ maxWidth: '100px', maxHeight: '100px' }}
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="col-md-4">
                          <label htmlFor="photo3" className="form-label">
                            Фото 3
                          </label>
                          <input
                            className="form-control"
                            type="file"
                            id="photo3"
                            accept="image/png"
                            onChange={handlePhotoChange}
                          />
                          {filePreviews.photo3 && (
                            <div className="mt-2">
                              <img 
                                src={filePreviews.photo3} 
                                alt="Превью" 
                                className="img-thumbnail" 
                                style={{ maxWidth: '100px', maxHeight: '100px' }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // Только просмотр
                  <>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h3 className="card-title mb-0">{pet.kind}</h3>
                      {/* Отображаем статус только если он есть */}
                      {pet.status && (
                        <div>
                          {getStatusBadge(pet.status)}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <p className="card-text">{pet.description || 'Описание отсутствует'}</p>
                    </div>
                    
                    <div className="row mt-4">
                      <div className="col-md-6">
                        <h5>Информация о животном</h5>
                        <ul className="list-group list-group-flush">
                          <li className="list-group-item d-flex justify-content-between">
                            <span>Вид:</span>
                            <span>{pet.kind}</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between">
                            <span>Порода:</span>
                            <span>{pet.breed || 'Не указано'}</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between">
                            <span>Клеймо/Чип:</span>
                            <span>{pet.mark || 'Не указано'}</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between">
                            <span>Район:</span>
                            <span>{pet.district || 'Не указано'}</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between">
                            <span>Дата находки:</span>
                            <span>{pet.date || 'Не указано'}</span>
                          </li>
                        </ul>
                      </div>
                      <div className="col-md-6">
                        <h5>Контактная информация</h5>
                        <ul className="list-group list-group-flush">
                          <li className="list-group-item d-flex justify-content-between">
                            <span>Имя:</span>
                            <span>{pet.name || 'Не указано'}</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between">
                            <span>Телефон:</span>
                            <span>{pet.phone || 'Не указано'}</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between">
                            <span>Email:</span>
                            <span>{pet.email || 'Не указано'}</span>
                          </li>
                          {/* УБРАЛИ СТАТУС ОБЪЯВЛЕНИЯ ИЗ КОНТАКТНОЙ ИНФОРМАЦИИ */}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            {/* Боковая панель */}
            <div className="card mb-4">
              <div className="card-body text-center">
                <h5 className="card-title">Это ваш питомец?</h5>
                <p className="card-text">
                  Свяжитесь с нашедшим для подтверждения и получения дополнительной информации
                </p>
                
                {/* Предупреждение для объявлений на модерации */}
                {pet.status === 'onModeration' && (
                  <div className="alert alert-warning mb-3">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Объявление на модерации. После проверки модератором оно станет доступно всем.
                  </div>
                )}
                
                {/* Сообщение для владельца на модерации */}
                {isOwner && pet.status === 'onModeration' && (
                  <div className="alert alert-info mb-3">
                    <i className="bi bi-info-circle me-2"></i>
                    Ваше объявление проверяется модератором. После одобрения оно будет опубликовано.
                  </div>
                )}
                
                <button 
                  className="btn btn-primary w-100 mb-2 btn-animated"
                  onClick={() => handleContact('call')}
                  disabled={!isLoggedIn}
                >
                  <i className="bi bi-telephone me-2" />
                  Позвонить
                </button>
                <button 
                  className="btn btn-outline-primary w-100 btn-animated"
                  onClick={() => handleContact('email')}
                  disabled={!isLoggedIn}
                >
                  <i className="bi bi-envelope me-2" />
                  Написать email
                </button>
                
                {!isLoggedIn && (
                  <div className="alert alert-info mt-3 mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Для связи необходимо <Link to="/sign-in">войти в систему</Link>
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

export default Card;
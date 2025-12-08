import React, { useState, useContext, useEffect } from 'react';
import { AuthContext, AlertContext } from '../../App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from "react-router-dom";
import { api } from '../../api';

function AddPet() {
  const { user, isLoggedIn, registerUser, loginUser } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    register: false,
    password: '',
    password_confirmation: '',
    kind: '',
    district: '',
    mark: '',
    description: '',
    photo1: null,
    photo2: null,
    photo3: null,
    confirm: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [filePreviews, setFilePreviews] = useState({});

  // Используйте useEffect для заполнения данных пользователя
  useEffect(() => {
    if (isLoggedIn && user) {
      // Заполняем данные пользователя из контекста
      setFormData(prev => ({
        ...prev,
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        register: false // Скрываем регистрацию для авторизованных пользователей
      }));
    }
  }, [isLoggedIn, user]);

  // Обработчики изменений формы
  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    
    // Если пользователь не авторизован и включает регистрацию, показываем поля пароля
    if (id === 'register' && !isLoggedIn) {
      setFormData(prev => ({
        ...prev,
        [id]: checked,
        password: checked ? '' : '',
        password_confirmation: checked ? '' : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFileChange = (e) => {
    const { id, files } = e.target;
    const file = files[0];
    
    if (file) {
      // Проверяем формат файла
      if (!file.type.includes('png')) {
        showAlert('Пожалуйста, загружайте только PNG изображения', 'warning');
        e.target.value = '';
        return;
      }
      
      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showAlert('Размер файла не должен превышать 5MB', 'warning');
        e.target.value = '';
        return;
      }
      
      // Создаем превью для изображения
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreviews(prev => ({
          ...prev,
          [id]: event.target.result
        }));
      };
      reader.readAsDataURL(file);
      
      setFormData(prev => ({
        ...prev,
        [id]: file
      }));
    } else {
      // Удаляем превью при снятии файла
      setFilePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[id];
        return newPreviews;
      });
      
      setFormData(prev => ({
        ...prev,
        [id]: null
      }));
    }
  };

  // Валидация пароля
  const validatePassword = (password) => {
    if (password.length < 7) return 'Пароль должен содержать минимум 7 символов';
    if (!/\d/.test(password)) return 'Пароль должен содержать хотя бы одну цифру';
    if (!/[a-z]/.test(password)) return 'Пароль должен содержать хотя бы одну строчную букву';
    if (!/[A-Z]/.test(password)) return 'Пароль должен содержать хотя бы одну заглавную букву';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Валидация
    const newErrors = {};
    
    // Общие поля
    if (!formData.name.trim()) newErrors.name = 'Имя обязательно';
    else if (!/^[А-Яа-яЁё\s\-]+$/.test(formData.name)) {
      newErrors.name = 'Имя должно содержать только кириллицу, пробелы и дефисы';
    }
    
    if (!formData.phone.trim()) newErrors.phone = 'Телефон обязателен';
    else if (!/^[\+\d]+$/.test(formData.phone)) {
      newErrors.phone = 'Телефон должен содержать только цифры и знак +';
    }
    
    if (!formData.email.trim()) newErrors.email = 'Email обязателен';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email адрес';
    }
    
    if (!formData.kind) newErrors.kind = 'Вид животного обязателен';
    if (!formData.district) newErrors.district = 'Район обязателен';
    if (!formData.description.trim()) newErrors.description = 'Описание обязательно';
    if (!formData.photo1) newErrors.photo1 = 'Основное фото обязательно';
    if (!formData.confirm) newErrors.confirm = 'Необходимо согласие на обработку персональных данных';
    
    // Поля для регистрации (только для неавторизованных пользователей)
    if (!isLoggedIn && formData.register) {
      if (!formData.password) {
        newErrors.password = 'Пароль обязателен';
      } else {
        const passwordError = validatePassword(formData.password);
        if (passwordError) newErrors.password = passwordError;
      }
      
      if (!formData.password_confirmation) {
        newErrors.password_confirmation = 'Подтверждение пароля обязательно';
      } else if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Пароли не совпадают';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      showAlert('Пожалуйста, исправьте ошибки в форме', 'warning');
      return;
    }

    try {
      // Если пользователь не авторизован и хочет зарегистрироваться
      let shouldAutoLogin = false;
      let registrationData = null;
      
      if (!isLoggedIn && formData.register) {
        // Сначала регистрируем пользователя
        registrationData = {
          name: formData.name.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          confirm: formData.confirm ? 1 : 0
        };
        
        console.log('Регистрация пользователя перед добавлением объявления:', registrationData);
        
        try {
          const registrationResult = await registerUser(registrationData);
          shouldAutoLogin = registrationResult.autoLogin;
          
          if (!shouldAutoLogin) {
            // Если автоматический вход не удался, пытаемся войти вручную
            try {
              await loginUser(registrationData.email, registrationData.password);
              shouldAutoLogin = true;
            } catch (loginError) {
              console.error('Ошибка входа после регистрации:', loginError);
              showAlert('Регистрация прошла успешно, но вход не удался. Пожалуйста, войдите вручную.', 'warning');
            }
          }
        } catch (regError) {
          console.error('Ошибка регистрации:', regError);
          showAlert('Ошибка регистрации: ' + regError.message, 'danger');
          setLoading(false);
          return;
        }
      }

      // Отправляем объявление
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('phone', formData.phone.replace(/\D/g, ''));
      formDataToSend.append('email', formData.email.trim().toLowerCase());
      formDataToSend.append('kind', formData.kind);
      formDataToSend.append('district', formData.district);
      if (formData.mark.trim()) formDataToSend.append('mark', formData.mark.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('photo1', formData.photo1);
      if (formData.photo2) formDataToSend.append('photo2', formData.photo2);
      if (formData.photo3) formDataToSend.append('photo3', formData.photo3);
      formDataToSend.append('confirm', formData.confirm ? 1 : 0);
      
      // Если пользователь регистрировался, добавляем пароль
      if (!isLoggedIn && formData.register) {
        formDataToSend.append('password', formData.password);
        formDataToSend.append('password_confirmation', formData.password_confirmation);
      }
      
      console.log('Отправка объявления...');
      const response = await api.addPet(formDataToSend);
      console.log('Ответ от добавления объявления:', response);
      
      let successMessage = 'Объявление успешно добавлено!';
      if (!isLoggedIn && formData.register && shouldAutoLogin) {
        successMessage += ' Вы были автоматически зарегистрированы и вошли в систему.';
      } else if (!isLoggedIn && formData.register && !shouldAutoLogin) {
        successMessage += ' Регистрация прошла успешно, но вход не удался. Пожалуйста, войдите вручную.';
      }
      
      showAlert(successMessage, 'success');
      
      // Перенаправляем на профиль
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
      
    } catch (error) {
      console.error('Ошибка добавления объявления:', error);
      
      let errorMessage = 'Ошибка добавления объявления: ';
      if (error.message.includes('422')) {
        errorMessage += 'Ошибка валидации данных. Проверьте введенные данные.';
      } else if (error.message.includes('401')) {
        errorMessage += 'Требуется авторизация.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Ошибка сети. Проверьте подключение к интернету.';
      } else {
        errorMessage += error.message;
      }
      
      showAlert(errorMessage, 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Если не авторизован, показываем null или лоадер
  if (!isLoggedIn && loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div id="add-pet" className="page fade-in active-page">
      <div className="container my-5">
        <h2 className="section-title">Добавить объявление о найденном животном</h2>
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card">
              <div className="card-body p-4">
                <form id="add-pet-form" onSubmit={handleSubmit} noValidate>
                  <div className="row g-3">
                    {/* Основная информация о пользователе */}
                    <div className="col-md-6">
                      <label htmlFor="name" className="form-label">
                        Ваше имя *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        pattern="[А-Яа-яЁё\s\-]+"
                        placeholder="Иван Иванов"
                      />
                      {errors.name && (
                        <div className="invalid-feedback">{errors.name}</div>
                      )}
                      <div className="form-text">
                        Только кириллица, пробелы и дефисы
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="phone" className="form-label">
                        Телефон *
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        pattern="[\+\d]+"
                        placeholder="+79111234567"
                      />
                      {errors.phone && (
                        <div className="invalid-feedback">{errors.phone}</div>
                      )}
                      <div className="form-text">
                        Только цифры и знак +
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <label htmlFor="email" className="form-label">
                        Email *
                      </label>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="user@example.ru"
                      />
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                    </div>
                    
                    {/* Переключатель регистрации - ТОЛЬКО для неавторизованных пользователей */}
                    {!isLoggedIn && (
                      <div className="col-12">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="register"
                            checked={formData.register}
                            onChange={handleInputChange}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="register"
                          >
                            <strong>Зарегистрироваться на сайте</strong> (рекомендуется)
                          </label>
                          <div className="form-text">
                            После добавления объявления вы автоматически создадите аккаунт и войдете в систему
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Поля для пароля - ТОЛЬКО если пользователь не авторизован И выбрал регистрацию */}
                    {!isLoggedIn && formData.register && (
                      <div className="col-12" id="password-fields">
                        <div className="alert alert-info mb-3">
                          <i className="bi bi-info-circle me-2"></i>
                          При регистрации будет создан ваш аккаунт для управления объявлениями
                        </div>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label htmlFor="password" className="form-label">
                              Пароль *
                            </label>
                            <input
                              type="password"
                              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                              id="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              minLength={7}
                              pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,}$"
                              placeholder="Пароль123"
                            />
                            {errors.password ? (
                              <div className="invalid-feedback">{errors.password}</div>
                            ) : (
                              <div className="form-text">
                                Минимум 7 символов: 1 цифра, 1 строчная и 1 заглавная буква
                              </div>
                            )}
                          </div>
                          
                          <div className="col-md-6">
                            <label htmlFor="password_confirmation" className="form-label">
                              Подтверждение пароля *
                            </label>
                            <input
                              type="password"
                              className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
                              id="password_confirmation"
                              value={formData.password_confirmation}
                              onChange={handleInputChange}
                              placeholder="Пароль123"
                            />
                            {errors.password_confirmation && (
                              <div className="invalid-feedback">{errors.password_confirmation}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Информация о животном */}
                    <div className="col-12 mt-3">
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="kind" className="form-label">
                        Вид животного *
                      </label>
                      <select 
                        className={`form-select ${errors.kind ? 'is-invalid' : ''}`} 
                        id="kind" 
                        value={formData.kind}
                        onChange={handleInputChange}
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
                      {errors.kind && (
                        <div className="invalid-feedback">{errors.kind}</div>
                      )}
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="district" className="form-label">
                        Район, где найдено животное *
                      </label>
                      <select 
                        className={`form-select ${errors.district ? 'is-invalid' : ''}`} 
                        id="district" 
                        value={formData.district}
                        onChange={handleInputChange}
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
                      {errors.district && (
                        <div className="invalid-feedback">{errors.district}</div>
                      )}
                    </div>
                    
                    <div className="col-12">
                      <label htmlFor="mark" className="form-label">
                        Клеймо/Чип (если есть)
                      </label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="mark" 
                        value={formData.mark}
                        onChange={handleInputChange}
                        placeholder="Например: VL-0214"
                      />
                      <div className="form-text">
                        Укажите номер клейма или чипа, если они есть у животного
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <label htmlFor="description" className="form-label">
                        Описание *
                      </label>
                      <textarea
                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                        id="description"
                        rows={5}
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        placeholder="Опишите животное: порода, окрас, особые приметы, поведение, место, где найдено, контактная информация и т.д."
                      />
                      {errors.description && (
                        <div className="invalid-feedback">{errors.description}</div>
                      )}
                      <div className="form-text">
                        Подробное описание поможет быстрее найти хозяина
                      </div>
                    </div>
                    
                    {/* Фотографии */}
                    <div className="col-12">
                      <div className="row g-3">
                        <div className="col-md-6 col-lg-4">
                          <label htmlFor="photo1" className="form-label">
                            Основное фото *
                          </label>
                          <input
                            className={`form-control ${errors.photo1 ? 'is-invalid' : ''}`}
                            type="file"
                            id="photo1"
                            accept="image/png"
                            onChange={handleFileChange}
                            required
                          />
                          {errors.photo1 && (
                            <div className="invalid-feedback">{errors.photo1}</div>
                          )}
                          <div className="form-text">
                            Основное фото (обязательно, формат PNG, максимум 5MB)
                          </div>
                          {filePreviews.photo1 && (
                            <div className="mt-2">
                              <img 
                                src={filePreviews.photo1} 
                                alt="Предпросмотр" 
                                className="img-thumbnail" 
                                style={{ maxWidth: '150px', maxHeight: '150px' }}
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="col-md-6 col-lg-4">
                          <label htmlFor="photo2" className="form-label">
                            Дополнительное фото
                          </label>
                          <input
                            className="form-control"
                            type="file"
                            id="photo2"
                            accept="image/png"
                            onChange={handleFileChange}
                          />
                          <div className="form-text">
                            Дополнительное фото (PNG, максимум 5MB)
                          </div>
                          {filePreviews.photo2 && (
                            <div className="mt-2">
                              <img 
                                src={filePreviews.photo2} 
                                alt="Предпросмотр" 
                                className="img-thumbnail" 
                                style={{ maxWidth: '150px', maxHeight: '150px' }}
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="col-md-6 col-lg-4">
                          <label htmlFor="photo3" className="form-label">
                            Дополнительное фото
                          </label>
                          <input
                            className="form-control"
                            type="file"
                            id="photo3"
                            accept="image/png"
                            onChange={handleFileChange}
                          />
                          <div className="form-text">
                            Дополнительное фото (PNG, максимум 5MB)
                          </div>
                          {filePreviews.photo3 && (
                            <div className="mt-2">
                              <img 
                                src={filePreviews.photo3} 
                                alt="Предпросмотр" 
                                className="img-thumbnail" 
                                style={{ maxWidth: '150px', maxHeight: '150px' }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Согласие */}
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className={`form-check-input ${errors.confirm ? 'is-invalid' : ''}`}
                          type="checkbox"
                          id="confirm"
                          checked={formData.confirm}
                          onChange={handleInputChange}
                          required
                        />
                        <label className="form-check-label" htmlFor="confirm">
                          <strong>Я согласен на обработку персональных данных *</strong>
                        </label>
                        {errors.confirm && (
                          <div className="invalid-feedback">{errors.confirm}</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Кнопка отправки */}
                    <div className="col-12 mt-4">
                      <div className="d-grid">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg btn-animated"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              {!isLoggedIn && formData.register ? 'Регистрация и отправка...' : 'Отправка...'}
                            </>
                          ) : (
                            <>
                              <i className="bi bi-plus-circle me-2"></i>
                              {!isLoggedIn && formData.register ? 'Добавить объявление и зарегистрироваться' : 'Добавить объявление'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPet;
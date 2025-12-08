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
    // Данные пользователя
    name: '',
    phone: '',
    email: '',
    register: isLoggedIn ? 0 : 0,
    password: '',
    password_confirmation: '',
    
    // Данные животного
    kind: '',
    district: '',
    mark: '',
    description: '',
    
    // Фотографии
    photo1: null,
    photo2: null,
    photo3: null,
    
    // Согласие
    confirm: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [filePreviews, setFilePreviews] = useState({});

  // Заполняем данные пользователя если авторизован
  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData(prev => ({
        ...prev,
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        register: 0 // Авторизованные пользователи всегда register=0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        register: 0, // Неавторизованные по умолчанию 0
        password: '',
        password_confirmation: ''
      }));
    }
  }, [isLoggedIn, user]);

  // Обработчики изменений формы
  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    
    // Особый случай для регистрации (только для неавторизованных)
    if (id === 'register' && !isLoggedIn) {
      setFormData(prev => ({
        ...prev,
        [id]: checked ? 1 : 0,
        password: '',
        password_confirmation: ''
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
      
      setFormData(prev => ({
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

    // Валидация формы
    const newErrors = {};
    
    // Обязательные поля
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
    
    // ДЛЯ ВСЕХ АВТОРИЗОВАННЫХ ПОЛЬЗОВАТЕЛЕЙ: ПАРОЛЬ ОБЯЗАТЕЛЕН ДЛЯ БЕЗОПАСНОСТИ
    if (isLoggedIn) {
      if (!formData.password) {
        newErrors.password = 'Введите пароль для подтверждения добавления объявления';
      } else if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Пароли не совпадают';
      }
    }
    
    // Для неавторизованных с регистрацией: пароль обязателен с валидацией
    if (!isLoggedIn && formData.register === 1) {
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
      // 1. Если пользователь не авторизован и хочет зарегистрироваться (register=1)
      if (!isLoggedIn && formData.register === 1) {
        try {
          // Регистрируем пользователя
          const registrationData = {
            name: formData.name.trim(),
            phone: formData.phone.replace(/\D/g, ''),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            password_confirmation: formData.password_confirmation,
            confirm: formData.confirm ? 1 : 0
          };
          
          console.log('Регистрация пользователя перед добавлением объявления:', registrationData);
          
          const registrationResponse = await api.register(registrationData);
          console.log('Ответ регистрации:', registrationResponse);
          
          // Пытаемся автоматически войти
          try {
            const loginResponse = await api.login(registrationData.email, registrationData.password);
            console.log('Ответ входа после регистрации:', loginResponse);
            
            // Получаем токен
            const userToken = loginResponse.data?.token || loginResponse.token;
            if (userToken) {
              localStorage.setItem('authToken', userToken);
              
              // Получаем данные пользователя
              try {
                const userResponse = await api.getCurrentUser();
                const userData = userResponse.data || userResponse;
                
                // Сохраняем данные
                localStorage.setItem('userData', JSON.stringify(userData));
                
                // Обновляем контекст через ручной вход
                await loginUser(registrationData.email, registrationData.password);
                
              } catch (userError) {
                console.error('Ошибка получения данных пользователя:', userError);
              }
            }
          } catch (loginError) {
            console.error('Ошибка входа после регистрации:', loginError);
            showAlert('Регистрация прошла успешно, но вход не удался. Пожалуйста, войдите вручную.', 'warning');
          }
        } catch (regError) {
          console.error('Ошибка регистрации:', regError);
          throw new Error('Ошибка регистрации: ' + regError.message);
        }
      }

      // 2. Подготавливаем FormData для отправки объявления
      const formDataToSend = new FormData();
      
      // Всегда передаем ВСЕ данные пользователя в точности как в примере
      formDataToSend.append('district', formData.district);
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('phone', formData.phone.replace(/\D/g, ''));
      formDataToSend.append('email', formData.email.trim().toLowerCase());
      formDataToSend.append('kind', formData.kind);
      
      // Опциональные поля
      if (formData.mark.trim()) {
        formDataToSend.append('mark', formData.mark.trim());
      }
      
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('photo1', formData.photo1);
      
      // Дополнительные фото если есть
      if (formData.photo2) formDataToSend.append('photo2', formData.photo2);
      if (formData.photo3) formDataToSend.append('photo3', formData.photo3);
      
      // Согласие
      formDataToSend.append('confirm', formData.confirm ? '1' : '0');
      
      // КЛЮЧЕВОЕ: передаем register и пароль ВСЕГДА
      formDataToSend.append('register', formData.register.toString());
      
      // Передаем пароль ВСЕГДА:
      // 1. Авторизованный пользователь (обязательно для безопасности)
      // 2. Неавторизованный с регистрацией (обязательно)
      // 3. Неавторизованный без регистрации (пустые строки)
      
      if (isLoggedIn || formData.register === 1) {
        // Для авторизованных и регистрирующихся передаем реальный пароль
        formDataToSend.append('password', formData.password);
        formDataToSend.append('password_confirmation', formData.password_confirmation || formData.password);
      } else {
        // Для неавторизованных без регистрации передаем пустые строки
        formDataToSend.append('password', '');
        formDataToSend.append('password_confirmation', '');
      }
      
      // Для отладки: выводим все данные FormData
      console.log('Отправляемые данные FormData:');
      for (let [key, value] of formDataToSend.entries()) {
        if (key.startsWith('photo')) {
          console.log(`${key}: [Файл] ${value.name} (${value.type}, ${value.size} байт)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      
      // 3. Отправляем объявление
      console.log('Отправка объявления на API...');
      const response = await api.addPet(formDataToSend);
      console.log('Ответ от API при добавлении объявления:', response);
      
      // 4. Обработка успешного ответа
let successMessage = 'Объявление успешно добавлено!';
let newPetId = null;

// Пытаемся получить ID нового объявления
if (response.data?.order?.id) {
  newPetId = response.data.order.id;
} else if (response.data?.id) {
  newPetId = response.data.id;
} else if (response.data?.order_id) {
  newPetId = response.data.order_id;
} else if (response.id) {
  newPetId = response.id;
} else if (response.order_id) {
  newPetId = response.order_id;
}

if (!isLoggedIn && formData.register === 1) {
  successMessage += ' Вы были автоматически зарегистрированы и вошли в систему.';
} else if (isLoggedIn) {
  successMessage += ' Объявление добавлено в ваш профиль.';
}

showAlert(successMessage, 'success');

// 5. Очищаем пароль из формы (для безопасности)
setFormData(prev => ({
  ...prev,
  password: '',
  password_confirmation: ''
}));

// 6. Перенаправляем на страницу объявления если есть ID, иначе на профиль
setTimeout(() => {
  if (newPetId) {
    navigate(`/pet/${newPetId}`);
  } else {
    navigate('/profile');
    showAlert('Объявление добавлено! ID не получен, перейдите в профиль чтобы просмотреть.', 'info');
  }
}, 1500);
      
    } catch (error) {
      console.error('Ошибка добавления объявления:', error);
      
      let errorMessage = 'Ошибка добавления объявления: ';
      
      if (error.message.includes('422')) {
        errorMessage = 'Ошибка валидации данных. Проверьте правильность заполнения всех полей.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Требуется авторизация. Пожалуйста, войдите в систему.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
      } else {
        errorMessage += error.message;
      }
      
      showAlert(errorMessage, 'danger');
    } finally {
      setLoading(false);
    }
  };

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
                      {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                      <div className="form-text">Только кириллица, пробелы и дефисы</div>
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
                      {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                      <div className="form-text">Только цифры и знак +</div>
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
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                    
                    {/* Для авторизованных пользователей: обязательный ввод пароля для безопасности */}
                    {isLoggedIn && (
                      <div className="col-12">
                        <div className="alert alert-warning mb-3">
                          <i className="bi bi-shield-exclamation me-2"></i>
                          <strong>Для безопасности требуется подтверждение паролем</strong>
                          <div className="mt-1">
                            Введите пароль от вашего аккаунта для добавления объявления
                          </div>
                        </div>
                        
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label htmlFor="password" className="form-label">
                              Пароль от аккаунта *
                            </label>
                            <input
                              type="password"
                              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                              id="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder="Введите ваш пароль"
                              required
                            />
                            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                            <div className="form-text">
                              Введите пароль от вашего аккаунта для подтверждения
                            </div>
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
                              placeholder="Подтвердите пароль"
                              required
                            />
                            {errors.password_confirmation && (
                              <div className="invalid-feedback">{errors.password_confirmation}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Переключатель регистрации - только для неавторизованных */}
                    {!isLoggedIn && (
                      <div className="col-12">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="register"
                            checked={formData.register === 1}
                            onChange={(e) => handleInputChange({
                              target: {
                                id: 'register',
                                type: 'checkbox',
                                checked: e.target.checked
                              }
                            })}
                          />
                          <label className="form-check-label" htmlFor="register">
                            <strong>Зарегистрироваться на сайте</strong> (рекомендуется)
                          </label>
                          <div className="form-text">
                            После добавления объявления вы автоматически создадите аккаунт и войдете в систему
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Поля для пароля - только при регистрации неавторизованных */}
                    {!isLoggedIn && formData.register === 1 && (
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
                              required
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
                              required
                            />
                            {errors.password_confirmation && (
                              <div className="invalid-feedback">{errors.password_confirmation}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Информация о животном */}
                    <div className="col-12 mt-4">
                      <h5 className="mb-3">Информация о животном</h5>
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
                      {errors.kind && <div className="invalid-feedback">{errors.kind}</div>}
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
                      {errors.district && <div className="invalid-feedback">{errors.district}</div>}
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
                        placeholder="Опишите животное: порода, окрас, особые приметы, поведение, место, где найдено и т.д."
                      />
                      {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                      <div className="form-text">
                        Подробное описание поможет быстрее найти хозяина
                      </div>
                    </div>
                    
                    {/* Фотографии */}
                    <div className="col-12">
                      <h5 className="mb-3">Фотографии животного</h5>
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
                          {errors.photo1 && <div className="invalid-feedback">{errors.photo1}</div>}
                          <div className="form-text">
                            Основное фото (обязательно, PNG, до 5MB)
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
                          <div className="form-text">Дополнительное фото (PNG, до 5MB)</div>
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
                          <div className="form-text">Дополнительное фото (PNG, до 5MB)</div>
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
                        {errors.confirm && <div className="invalid-feedback">{errors.confirm}</div>}
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
                              {!isLoggedIn && formData.register === 1 ? 'Регистрация и отправка...' : 'Отправка...'}
                            </>
                          ) : (
                            <>
                              <i className="bi bi-plus-circle me-2"></i>
                              {!isLoggedIn && formData.register === 1 ? 'Добавить объявление и зарегистрироваться' : 'Добавить объявление'}
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
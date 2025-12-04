import React, { useState, useContext, useEffect } from 'react';
import { AuthContext, AlertContext } from '../../App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from "react-router-dom";
import { api } from '../../api';

function AddPet() {
  const { user, isLoggedIn } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const navigate = useNavigate();

  // ВСЕ хуки должны быть здесь, ВЫШЕ любых условных операторов
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

  // Используйте useEffect для редиректа, а не условный рендеринг в начале
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/sign-in');
    } else {
      // Заполняем данные пользователя после проверки авторизации
      setFormData(prev => ({
        ...prev,
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || ''
      }));
    }
  }, [isLoggedIn, navigate, user]);

  // Если не авторизован, показываем null или лоадер
  if (!isLoggedIn) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Перенаправление...</span>
        </div>
      </div>
    );
  }

  // Обработчики изменений формы
  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const { id, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: files[0] || null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Валидация
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Имя обязательно';
    if (!formData.phone.trim()) newErrors.phone = 'Телефон обязателен';
    if (!formData.email.trim()) newErrors.email = 'Email обязателен';
    if (!formData.kind) newErrors.kind = 'Вид животного обязателен';
    if (!formData.district) newErrors.district = 'Район обязателен';
    if (!formData.description.trim()) newErrors.description = 'Описание обязательно';
    if (!formData.photo1) newErrors.photo1 = 'Основное фото обязательно';
    if (!formData.confirm) newErrors.confirm = 'Необходимо согласие';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('kind', formData.kind);
      formDataToSend.append('district', formData.district);
      if (formData.mark) formDataToSend.append('mark', formData.mark);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('photo1', formData.photo1);
      if (formData.photo2) formDataToSend.append('photo2', formData.photo2);
      if (formData.photo3) formDataToSend.append('photo3', formData.photo3);
      formDataToSend.append('confirm', formData.confirm ? 1 : 0);

      if (formData.register) {
        formDataToSend.append('password', formData.password);
        formDataToSend.append('password_confirmation', formData.password_confirmation);
      }

      await api.addPet(formDataToSend);
      showAlert('Объявление успешно добавлено!', 'success');
      navigate('/profile');
    } catch (error) {
      showAlert('Ошибка добавления объявления: ' + error.message, 'danger');
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
                <form id="add-pet-form" onSubmit={handleSubmit}>
                  <div className="row g-3">
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
                        pattern="[А-Яа-я\s\-]+"
                      />
                      {errors.name && (
                        <div className="invalid-feedback">{errors.name}</div>
                      )}
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
                      />
                      {errors.phone && (
                        <div className="invalid-feedback">{errors.phone}</div>
                      )}
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
                      />
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                    </div>
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
                          Зарегистрироваться на сайте
                        </label>
                      </div>
                    </div>
                    {formData.register && (
                      <div className="col-12" id="password-fields">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label htmlFor="password" className="form-label">
                              Пароль *
                            </label>
                            <input
                              type="password"
                              className="form-control"
                              id="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              minLength={7}
                              pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,}$"
                            />
                            <div className="invalid-feedback">
                              Пароль должен содержать минимум 7 символов, включая 1 цифру, 1 строчную и 1 заглавную букву
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label
                              htmlFor="password_confirmation"
                              className="form-label"
                            >
                              Подтверждение пароля *
                            </label>
                            <input
                              type="password"
                              className="form-control"
                              id="password_confirmation"
                              value={formData.password_confirmation}
                              onChange={handleInputChange}
                            />
                            <div className="invalid-feedback">
                              Пароли не совпадают
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="description" className="form-label">
                        Описание *
                      </label>
                      <textarea
                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                        id="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        placeholder="Опишите животное: порода, окрас, особые приметы, поведение и т.д."
                      />
                      {errors.description && (
                        <div className="invalid-feedback">{errors.description}</div>
                      )}
                    </div>
                    <div className="col-12">
                      <label className="form-label">Фотографии *</label>
                      <div className="mb-3">
                        <input
                          className={`form-control ${errors.photo1 ? 'is-invalid' : ''}`}
                          type="file"
                          id="photo1"
                          accept="image/png"
                          onChange={handleFileChange}
                          required
                        />
                        <div className="form-text">Основное фото (обязательно, формат PNG)</div>
                        {errors.photo1 && (
                          <div className="invalid-feedback">{errors.photo1}</div>
                        )}
                      </div>
                      <div className="mb-3">
                        <input
                          className="form-control"
                          type="file"
                          id="photo2"
                          accept="image/png"
                          onChange={handleFileChange}
                        />
                        <div className="form-text">Дополнительное фото (PNG)</div>
                      </div>
                      <div className="mb-3">
                        <input
                          className="form-control"
                          type="file"
                          id="photo3"
                          accept="image/png"
                          onChange={handleFileChange}
                        />
                        <div className="form-text">Дополнительное фото (PNG)</div>
                      </div>
                    </div>
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
                          Я согласен на обработку персональных данных *
                        </label>
                        {errors.confirm && (
                          <div className="invalid-feedback">{errors.confirm}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 btn-animated"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Отправка...
                          </>
                        ) : (
                          'Добавить объявление'
                        )}
                      </button>
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

export default AddPet; // Убедитесь, что это есть в конце файла
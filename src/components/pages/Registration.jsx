import React, { useState, useContext } from 'react';
import { AuthContext, AlertContext } from '../../App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link, useNavigate } from "react-router-dom";

function Registration() {
  const { registerUser } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Простая валидация
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Имя обязательно';
    if (!formData.phone.trim()) newErrors.phone = 'Телефон обязателен';
    if (!formData.email.trim()) newErrors.email = 'Email обязателен';
    if (!formData.password) newErrors.password = 'Пароль обязателен';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Подтверждение пароля обязательно';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Пароли не совпадают';
    if (!formData.agree) newErrors.agree = 'Необходимо согласие на обработку персональных данных';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработчик изменения полей
  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    
    // Для телефона оставляем только цифры и +
    let processedValue = value;
    if (id === 'phone') {
      processedValue = value.replace(/[^\d+]/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : processedValue
    }));
    
    // Очистка ошибки при вводе
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showAlert('Пожалуйста, заполните все поля правильно', 'danger');
      return;
    }

    setLoading(true);
    
    // Форматируем данные ТОЧНО как в примере из PDF
    const userData = {
      name: formData.name.trim(),
      phone: formData.phone.replace(/[^\d+]/g, ''), // Оставляем только цифры и +
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      password_confirmation: formData.confirmPassword,
      confirm: formData.agree ? 1 : 0 // Должно быть число 1 (true) или 0 (false)
    };
    
    console.log('Подготовленные данные для регистрации:', userData);
    
    // Проверяем, что данные соответствуют примеру из PDF
    const expectedFormat = {
      name: "Иван",
      phone: "89001234567",
      email: "user@user.ru",
      password: "paSSword1",
      password_confirmation: "paSSword1",
      confirm: 1
    };
    
    console.log('Ожидаемый формат из PDF:', expectedFormat);
    console.log('Наши данные совпадают?', 
      Object.keys(expectedFormat).every(key => {
        if (key === 'confirm') {
          return userData[key] === expectedFormat[key];
        }
        return typeof userData[key] === typeof expectedFormat[key];
      })
    );

    try {
      const success = await registerUser(userData);
      if (success) {
        // Успешная регистрация
        setTimeout(() => {
          navigate('/sign-in');
        }, 2000);
      }
    } catch (error) {
      console.error('Ошибка в Registration.jsx:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="registration" className="page fade-in active-page">
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card">
              <div className="card-body p-4">
                <h2 className="text-center mb-4">Регистрация</h2>
                <p className="text-center text-muted mb-4">
                  Все поля, отмеченные *, обязательны для заполнения
                </p>
                
                <form id="registration-form" onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Имя *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Иван"
                      required
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                    <small className="form-text text-muted">
                      Только кириллица, пробелы и дефисы
                    </small>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="89001234567"
                      required
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">{errors.phone}</div>
                    )}
                    <small className="form-text text-muted">
                      Только цифры и знак + (например: 89001234567 или +79001234567)
                    </small>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email *
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="user@user.ru"
                      required
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Пароль *
                    </label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      id="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="paSSword1"
                      required
                      minLength="7"
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                    <small className="form-text text-muted">
                      Минимум 7 символов, должна быть хотя бы 1 цифра, 1 строчная и 1 заглавная буква
                    </small>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Подтверждение пароля *
                    </label>
                    <input
                      type="password"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="paSSword1"
                      required
                    />
                    {errors.confirmPassword && (
                      <div className="invalid-feedback">{errors.confirmPassword}</div>
                    )}
                  </div>
                  
                  <div className="mb-3 form-check">
                    <input
                      className={`form-check-input ${errors.agree ? 'is-invalid' : ''}`}
                      type="checkbox"
                      id="agree"
                      checked={formData.agree}
                      onChange={handleInputChange}
                      required
                    />
                    <label className="form-check-label" htmlFor="agree">
                      Я согласен на обработку персональных данных *
                    </label>
                    {errors.agree && (
                      <div className="invalid-feedback d-block">{errors.agree}</div>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary w-100 btn-animated py-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Регистрация...
                      </>
                    ) : (
                      'Зарегистрироваться'
                    )}
                  </button>
                  
                  <div className="text-center mt-3">
                    <p>
                      Уже есть аккаунт?{' '}
                      <Link to="/sign-in" className="text-primary">
                        Войдите
                      </Link>
                    </p>
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

export default Registration;
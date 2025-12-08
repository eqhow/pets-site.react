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

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    
    // Для телефона оставляем только цифры
    let processedValue = value;
    if (id === 'phone') {
      processedValue = value.replace(/\D/g, '');
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

  const validateForm = () => {
    const newErrors = {};
    
    // Валидация имени
    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    } else if (!/^[а-яА-ЯёЁ\s-]+$/.test(formData.name)) {
      newErrors.name = 'Имя должно содержать только кириллицу, пробелы и дефисы';
    }
    
    // Валидация телефона
    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен';
    } else if (formData.phone.replace(/\D/g, '').length < 11) {
      newErrors.phone = 'Телефон должен содержать минимум 11 цифр';
    }
    
    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Введите корректный email адрес';
    }
    
    // Валидация пароля
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 7) {
      newErrors.password = 'Пароль должен содержать минимум 7 символов';
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Пароль должен содержать хотя бы одну цифру';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Пароль должен содержать хотя бы одну строчную букву';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Пароль должен содержать хотя бы одну заглавную букву';
    }
    
    // Валидация подтверждения пароля
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтверждение пароля обязательно';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    // Согласие
    if (!formData.agree) {
      newErrors.agree = 'Необходимо согласие на обработку персональных данных';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    // Форматируем данные точно как ожидает API
    const userData = {
      name: formData.name.trim(),
      phone: formData.phone.replace(/\D/g, ''), // Только цифры
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      password_confirmation: formData.confirmPassword,
      confirm: formData.agree ? 1 : 0
    };
    
    console.log('Отправка данных регистрации:', userData);

    try {
      // Используем registerUser из AuthContext
      const result = await registerUser(userData);
      
      if (result.success) {
        if (result.autoLogin) {
          // Автоматический вход успешен
          navigate('/profile');
        } else {
          // Требуется ручной вход
          showAlert('Регистрация успешна! Теперь войдите в систему.', 'success');
          navigate('/sign-in');
        }
      }
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      // Ошибка уже обработана в registerUser
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
                      required
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">{errors.phone}</div>
                    )}
                    <small className="form-text text-muted">
                      Только цифры, начинается с 7 или 8, минимум 11 цифр
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
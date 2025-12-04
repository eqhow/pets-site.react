import React, { useState, useContext } from 'react';
import { AuthContext, AlertContext } from '../../App'; // Изменено
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link, useNavigate } from "react-router-dom";
import { api } from '../../api'; // Изменено

function Registration() {
  const { registerUser } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const navigate = useNavigate();

  // Состояние формы
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false
  });

  // Состояние ошибок валидации
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Добавьте эту строку

  // Валидация имени
  const validateName = (name) => {
    const nameRegex = /^[А-Яа-я\s\-]+$/;
    if (!name.trim()) return 'Имя обязательно для заполнения';
    if (!nameRegex.test(name)) return 'Имя должно содержать только кириллицу, пробелы и дефисы';
    return '';
  };

  // Валидация телефона
  const validatePhone = (phone) => {
    const phoneRegex = /^[\+\d]+$/;
    if (!phone.trim()) return 'Телефон обязателен для заполнения';
    if (!phoneRegex.test(phone)) return 'Телефон должен содержать только цифры и знак +';
    return '';
  };

  // Валидация email
  const validateEmail = (email) => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email.trim()) return 'Email обязателен для заполнения';
    if (!emailRegex.test(email)) return 'Пожалуйста, введите корректный email';
    return '';
  };

  // Валидация пароля
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,}$/;
    if (!password) return 'Пароль обязателен для заполнения';
    if (!passwordRegex.test(password)) return 'Пароль должен содержать минимум 7 символов, включая 1 цифру, 1 строчную и 1 заглавную букву';
    return '';
  };

  // Валидация подтверждения пароля
  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Подтверждение пароля обязательно';
    if (password !== confirmPassword) return 'Пароли не совпадают';
    return '';
  };

  // Обработчик изменения полей
  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));

    // Очистка ошибки при вводе
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  // Валидация всей формы
  const validateForm = () => {
    const newErrors = {
      name: validateName(formData.name),
      phone: validatePhone(formData.phone),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword),
      agree: formData.agree ? '' : 'Необходимо согласие на обработку персональных данных'
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showAlert('Пожалуйста, исправьте ошибки в форме', 'danger');
      return;
    }

    setLoading(true); // Добавьте это
    const userData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
      confirm: formData.agree ? 1 : 0
    };

    try {
      if (await registerUser(userData)) {
        navigate('/sign-in');
      }
    } catch (error) {
      showAlert('Ошибка регистрации', 'danger');
    } finally {
      setLoading(false); // Добавьте это
    }
  };

  // Валидация при потере фокуса
  const handleBlur = (field) => {
    let error = '';
    
    switch (field) {
      case 'name':
        error = validateName(formData.name);
        break;
      case 'phone':
        error = validatePhone(formData.phone);
        break;
      case 'email':
        error = validateEmail(formData.email);
        break;
      case 'password':
        error = validatePassword(formData.password);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.password, formData.confirmPassword);
        break;
      default:
        break;
    }
    
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
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
                  <div className="row g-3">
                    <div className="col-12">
                      <label htmlFor="name" className="form-label">
                        Имя *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('name')}
                        required
                      />
                      {errors.name && (
                        <div className="invalid-feedback">{errors.name}</div>
                      )}
                    </div>
                    
                    <div className="col-12">
                      <label htmlFor="phone" className="form-label">
                        Телефон *
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('phone')}
                        required
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
                        onBlur={() => handleBlur('email')}
                        required
                      />
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                    </div>
                    
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
                        onBlur={() => handleBlur('password')}
                        required
                        minLength={7}
                      />
                      {errors.password && (
                        <div className="invalid-feedback">{errors.password}</div>
                      )}
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="confirmPassword" className="form-label">
                        Подтверждение пароля *
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('confirmPassword')}
                        required
                      />
                      {errors.confirmPassword && (
                        <div className="invalid-feedback">{errors.confirmPassword}</div>
                      )}
                    </div>
                    
                    <div className="col-12">
                      <div className="form-check">
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
                    </div>
                    
                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-primary w-100 btn-animated"
                        disabled={loading}
                      >
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                      </button>
                    </div>
                    
                    <div className="col-12 text-center mt-3">
                      <p>
                        Уже есть аккаунт?{' '}
                        <Link to="/sign-in" className="text-primary">
                          Войдите
                        </Link>
                      </p>
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

export default Registration;
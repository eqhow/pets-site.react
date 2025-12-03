import React, { useState, useContext } from 'react';
import { AuthContext, PetsContext, AlertContext } from '../../App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link, useNavigate } from 'react-router-dom';

function SignIn() {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Состояние формы
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    remember: false
  });
  
  // Состояние ошибок
  const [errors, setErrors] = useState({});

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

  // Валидация формы
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Пожалуйста, введите email или номер телефона';
    }
    
    if (!formData.password) {
      newErrors.password = 'Пожалуйста, введите пароль';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (loginUser(formData.identifier, formData.password)) {
      navigate('/profile');
      
      // Сохранение в localStorage если выбрано "Запомнить меня"
      if (formData.remember) {
        localStorage.setItem('findpets_remember_login', 'true');
        localStorage.setItem('findpets_last_identifier', formData.identifier);
      }
    }
  };

  // Загрузка сохраненных данных при монтировании
  React.useEffect(() => {
    const remember = localStorage.getItem('findpets_remember_login');
    const lastIdentifier = localStorage.getItem('findpets_last_identifier');
    
    if (remember === 'true' && lastIdentifier) {
      setFormData(prev => ({
        ...prev,
        identifier: lastIdentifier,
        remember: true
      }));
    }
  }, []);

  return (
    <div id="login" className="page fade-in active-page">
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card">
              <div className="card-body p-4">
                <h2 className="text-center mb-4">Вход в личный кабинет</h2>
                <form id="login-form" onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label htmlFor="identifier" className="form-label">
                      Email или номер телефона *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.identifier ? 'is-invalid' : ''}`}
                      id="identifier"
                      value={formData.identifier}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.identifier && (
                      <div className="invalid-feedback">{errors.identifier}</div>
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
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>
                  
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="remember"
                      checked={formData.remember}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="remember">
                      Запомнить меня
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary w-100 mb-3 btn-animated"
                  >
                    Войти
                  </button>
                  
                  <div className="text-center">
                    <Link to="/registration" className="text-decoration-none">
                      Нет аккаунта? Зарегистрируйтесь
                    </Link>
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

export default SignIn;
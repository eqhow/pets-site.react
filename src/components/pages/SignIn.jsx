import React, { useState, useContext } from 'react';
import { AuthContext, AlertContext } from '../../App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link, useNavigate } from 'react-router-dom';

function SignIn() {
  const { loginUser } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    remember: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      if (await loginUser(formData.identifier, formData.password)) {
        navigate('/profile');
        
        if (formData.remember) {
          localStorage.setItem('findpets_remember_login', 'true');
          localStorage.setItem('findpets_last_identifier', formData.identifier);
        }
      }
    } catch (error) {
      showAlert('Ошибка входа', 'danger');
    } finally {
      setLoading(false);
    }
  };

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
                    disabled={loading}
                  >
                    {loading ? 'Вход...' : 'Войти'}
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
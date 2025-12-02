import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { Link } from 'react-router-dom';
import Registration from './Registration';

function SignIn(props) {
    return (
        <div id="login" className="page fade-in active-page">
  <div className="container my-5">
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card">
          <div className="card-body p-4">
            <h2 className="text-center mb-4">Вход в личный кабинет</h2>
            <form id="login-form">
              <div className="mb-3">
                <label htmlFor="login-identifier" className="form-label">
                  Email или номер телефона *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="login-identifier"
                  required=""
                />
                <div className="invalid-feedback">
                  Пожалуйста, введите email или номер телефона
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="login-password" className="form-label">
                  Пароль *
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="login-password"
                  required=""
                />
                <div className="invalid-feedback">
                  Пожалуйста, введите пароль
                </div>
              </div>
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="login-remember"
                />
                <label className="form-check-label" htmlFor="login-remember">
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
                <Link className = "text-center" to="/registration"> Нет аккаунта? Зарегистрируйтесь </Link>
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
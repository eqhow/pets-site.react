import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from "react-router-dom";

function Registration(props) {
    return (
<div id="registration" className="page fade-in active-page">
  <div className="container my-5">
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card">
          <div className="card-body p-4">
            <h2 className="text-center mb-4">Регистрация</h2>
            <form id="registration-form">
              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="reg-name" className="form-label">
                    Имя *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="reg-name"
                    required=""
                    pattern="[А-Яа-я\s\-]+"
                  />
                  <div className="invalid-feedback">
                    Имя должно содержать только кириллицу, пробелы и дефисы
                  </div>
                </div>
                <div className="col-12">
                  <label htmlFor="reg-phone" className="form-label">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="reg-phone"
                    required=""
                    pattern="[\+\d]+"
                  />
                  <div className="invalid-feedback">
                    Телефон должен содержать только цифры и знак +
                  </div>
                </div>
                <div className="col-12">
                  <label htmlFor="reg-email" className="form-label">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="reg-email"
                    required=""
                  />
                  <div className="invalid-feedback">
                    Пожалуйста, введите корректный email
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="reg-password" className="form-label">
                    Пароль *
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="reg-password"
                    required=""
                    minLength={7}
                    pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,}$"
                  />
                  <div className="invalid-feedback">
                    Пароль должен содержать минимум 7 символов, включая 1 цифру,
                    1 строчную и 1 заглавную букву
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="reg-password-confirm" className="form-label">
                    Подтверждение пароля *
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="reg-password-confirm"
                    required=""
                  />
                  <div className="invalid-feedback">Пароли не совпадают</div>
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="reg-confirm"
                      required=""
                    />
                    <label className="form-check-label" htmlFor="reg-confirm">
                      Я согласен на обработку персональных данных *
                    </label>
                    <div className="invalid-feedback">
                      Необходимо согласие на обработку персональных данных
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-primary w-100 btn-animated"
                  >
                    Зарегистрироваться
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

export default Registration;
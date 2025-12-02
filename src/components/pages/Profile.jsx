import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from "react-router-dom";

function Profile(props) {
    return (
<div id="profile" className="page fade-in">
  <div className="container my-5">
    <h2 className="section-title">Личный кабинет</h2>
    <div className="row">
      {/* Информация о пользователе */}
      <div className="col-lg-4 mb-4">
        <div className="card">
          <div className="card-body text-center">
            <div className="mb-3">
              <i className="bi bi-person-circle profile-avatar" />
            </div>
            <h4 id="profile-user-name">Иван Иванов</h4>
            <p className="text-muted" id="profile-registration-date">
              Зарегистрирован: 2 года, 3 месяца, 15 дней
            </p>
            <div className="row text-center mt-3">
              <div className="col-6">
                <div className="stats-card rounded-3 p-2 mb-2">
                  <h5>4</h5>
                  <small>Объявления</small>
                </div>
              </div>
              <div className="col-6">
                <div className="stats-card rounded-3 p-2 mb-2">
                  <h5>2</h5>
                  <small>Найдены хозяева</small>
                </div>
              </div>
            </div>
            <button
              className="btn btn-outline-primary btn-sm mt-3 btn-animated"
              onclick="logout()"
            >
              <i className="bi bi-box-arrow-right me-1" />
              Выйти
            </button>
          </div>
        </div>
        {/* Форма изменения телефона */}
        <div className="card mt-4">
          <div className="card-body">
            <h5 className="card-title">Изменить телефон</h5>
            <form id="phone-form">
              <div className="mb-3">
                <input
                  type="tel"
                  className="form-control"
                  id="profile-phone"
                  defaultValue={+79111234567}
                  required=""
                  pattern="[\+\d]+"
                />
                <div className="invalid-feedback">
                  Телефон должен содержать только цифры и знак +
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 btn-animated"
              >
                Сохранить
              </button>
            </form>
          </div>
        </div>
        {/* Форма изменения email */}
        <div className="card mt-4">
          <div className="card-body">
            <h5 className="card-title">Изменить email</h5>
            <form id="email-form">
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="profile-email"
                  defaultValue="user@user.ru"
                  required=""
                />
                <div className="invalid-feedback">
                  Пожалуйста, введите корректный email
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 btn-animated"
              >
                Сохранить
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* Объявления пользователя */}
      <div className="col-lg-8">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Мои объявления</h5>
            <div className="list-group list-group-flush">
              <div className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h6>Найдена кошка, порода Сфинкс</h6>
                  <small className="text-muted">
                    Район: Василеостровский | Дата: 01-06-2025
                  </small>
                </div>
                <div>
                  <span className="badge badge-status badge-moderation">
                    На модерации
                  </span>
                  <div className="btn-group btn-group-sm ms-2">
                    <button
                      className="btn btn-outline-primary btn-animated"
                      onclick="editOrder(1)"
                    >
                      Редактировать
                    </button>
                    <button
                      className="btn btn-outline-danger btn-animated"
                      onclick="deleteOrder(1)"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
              <div className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h6>Найдена собака, порода Лабрадор</h6>
                  <small className="text-muted">
                    Район: Центральный | Дата: 15-05-2025
                  </small>
                </div>
                <div>
                  <span className="badge badge-status badge-active">
                    Активное
                  </span>
                  <div className="btn-group btn-group-sm ms-2">
                    <button
                      className="btn btn-outline-primary btn-animated"
                      onclick="editOrder(2)"
                    >
                      Редактировать
                    </button>
                    <button
                      className="btn btn-outline-danger btn-animated"
                      onclick="deleteOrder(2)"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
              <div className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h6>Найден попугай, волнистый</h6>
                  <small className="text-muted">
                    Район: Адмиралтейский | Дата: 10-04-2025
                  </small>
                </div>
                <div>
                  <span className="badge badge-status badge-found">
                    Хозяин найден
                  </span>
                  <div className="btn-group btn-group-sm ms-2">
                    <button className="btn btn-outline-secondary" disabled="">
                      Редактировать
                    </button>
                    <button className="btn btn-outline-secondary" disabled="">
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
              <div className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h6>Найдена кошка, рыжая</h6>
                  <small className="text-muted">
                    Район: Фрунзенский | Дата: 22-03-2025
                  </small>
                </div>
                <div>
                  <span className="badge badge-status badge-archive">
                    В архиве
                  </span>
                  <div className="btn-group btn-group-sm ms-2">
                    <button className="btn btn-outline-secondary" disabled="">
                      Редактировать
                    </button>
                    <button className="btn btn-outline-secondary" disabled="">
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    );
}

export default Profile;
import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from "react-router-dom";

function Card(props) {
    return (
<div id="pet-card" className="page fade-in">
  <div className="container my-5">
    <div className="row">
      <div className="col-lg-8">
        {/* Фотографии животного */}
        <div
          id="petCarousel"
          className="carousel slide mb-4"
          data-bs-ride="carousel"
        >
          <div className="carousel-indicators">
            <button
              type="button"
              data-bs-target="#petCarousel"
              data-bs-slide-to={0}
              className="active"
            />
            <button
              type="button"
              data-bs-target="#petCarousel"
              data-bs-slide-to={1}
            />
            <button
              type="button"
              data-bs-target="#petCarousel"
              data-bs-slide-to={2}
            />
          </div>
          <div className="carousel-inner rounded-3">
            <div className="carousel-item active">
              <img
                src="img/pets/сфинкс1.jpg"
                className="d-block w-100"
                alt="Кошка фото 1"
                style={{ height: 400, objectFit: "cover" }}
              />
            </div>
            <div className="carousel-item">
              <img
                src="img/pets/сфинкс2.jpg"
                className="d-block w-100"
                alt="Кошка фото 2"
                style={{ height: 400, objectFit: "cover" }}
              />
            </div>
            <div className="carousel-item">
              <img
                src="img/pets/сфинкс3.jpg"
                className="d-block w-100"
                alt="Кошка фото 3"
                style={{ height: 400, objectFit: "cover" }}
              />
            </div>
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#petCarousel"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" />
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#petCarousel"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" />
          </button>
        </div>
        {/* Описание животного */}
        <div className="card">
          <div className="card-body">
            <h3 className="card-title">Найдена кошка, порода Сфинкс</h3>
            <p className="card-text">
              Найдена кошка, порода Сфинкс, очень грустная. Найдена в
              Василеостровском районе, недалеко от метро. Кошка без ошейника, но
              с клеймом VL-0214. Очень ласковая, приучена к лотку. Ищет хозяев
              или временную передержку.
            </p>
            <div className="row mt-4">
              <div className="col-md-6">
                <h5>Информация о животном</h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Вид:</span>
                    <span>Кошка</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Порода:</span>
                    <span>Сфинкс</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Клеймо/Чип:</span>
                    <span>VL-0214</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Район:</span>
                    <span>Василеостровский</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Дата находки:</span>
                    <span>01-06-2025</span>
                  </li>
                </ul>
              </div>
              <div className="col-md-6">
                <h5>Контактная информация</h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Имя:</span>
                    <span>Иван</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Телефон:</span>
                    <span>+79112345678</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Email:</span>
                    <span>user@user.ru</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Статус объявления:</span>
                    <span className="badge badge-moderation">На модерации</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-4">
        {/* Боковая панель */}
        <div className="card mb-4">
          <div className="card-body text-center">
            <h5 className="card-title">Это ваш питомец?</h5>
            <p className="card-text">
              Свяжитесь с нашедшим для подтверждения и получения дополнительной
              информации
            </p>
            <button className="btn btn-primary w-100 mb-2 btn-animated">
              <i className="bi bi-telephone me-2" />
              Позвонить
            </button>
            <button className="btn btn-outline-primary w-100 btn-animated">
              <i className="bi bi-envelope me-2" />
              Написать email
            </button>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Похожие объявления</h5>
            <div className="list-group list-group-flush">
              <a
                href="#"
                className="list-group-item list-group-item-action"
                onclick="showPage('pet-card')"
              >
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">Найдена кошка, серая</h6>
                  <small>2 дня назад</small>
                </div>
                <p className="mb-1">Район: Центральный</p>
              </a>
              <a
                href="#"
                className="list-group-item list-group-item-action"
                onclick="showPage('pet-card')"
              >
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">Найдена кошка, пушистая</h6>
                  <small>5 дней назад</small>
                </div>
                <p className="mb-1">Район: Фрунзенский</p>
              </a>
              <a
                href="#"
                className="list-group-item list-group-item-action"
                onclick="showPage('pet-card')"
              >
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">Найден кот, рыжий</h6>
                  <small>1 неделю назад</small>
                </div>
                <p className="mb-1">Район: Адмиралтейский</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    );
}

export default Card;
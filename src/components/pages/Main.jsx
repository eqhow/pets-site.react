import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from "react-router-dom";

function Home(props) {
    return (
<div className="main-content">
  {/* Главная страница */}
  <div id="home" className="page active-page fade-in">
    {/* Слайдер с успешными историями */}
    <br />
    <section className="container mb-5">
      <h2 className="section-title">Успешные воссоединения</h2>
      <div
        id="successStoriesCarousel"
        className="carousel slide"
        data-bs-ride="carousel"
      >
        <div className="carousel-indicators">
          <button
            type="button"
            data-bs-target="#successStoriesCarousel"
            data-bs-slide-to={0}
            className="active"
          />
          <button
            type="button"
            data-bs-target="#successStoriesCarousel"
            data-bs-slide-to={1}
          />
          <button
            type="button"
            data-bs-target="#successStoriesCarousel"
            data-bs-slide-to={2}
          />
        </div>
        <div className="carousel-inner rounded-3">
          <div className="carousel-item active">
            <img
              src="../assets/css/images/мурка.jpg"
              className="d-block w-100"
              alt="Cat reunion"
            />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded-3 p-3">
              <h5>Мурка вернулась домой</h5>
              <p>
                После 2 недель поисков кошка Мурка была найдена и вернулась к
                своей семье.
              </p>
            </div>
          </div>
          <div className="carousel-item">
            <img
              src="./"
              className="d-block w-100"
              alt="Dog reunion"
            />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded-3 p-3">
              <h5>Бадди снова с хозяином</h5>
              <p>
                Собака породы лабрадор была найдена через 5 дней после пропажи.
              </p>
            </div>
          </div>
          <div className="carousel-item">
            <img
              src="img/pets/симба.jpg"
              className="d-block w-100"
              alt="Cat reunion 2"
            />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded-3 p-3">
              <h5>Симба нашел новый дом</h5>
              <p>Котенок был найден на улице и теперь обрел любящую семью.</p>
            </div>
          </div>
        </div>
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#successStoriesCarousel"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" />
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#successStoriesCarousel"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" />
        </button>
      </div>
    </section>
    {/* Карточки недавно найденных животных */}
    <section className="container mb-5">
      <h2 className="section-title">Недавно найденные животные</h2>
      <div className="row g-4">
        <div className="col-md-6 col-lg-4">
          <div className="card h-100">
            <img
              src="img/pets/пес_рыжий.jpg"
              className="card-img-top pet-card-img"
              alt="Found dog"
            />
            <div className="card-body">
              <h5 className="card-title">Пес Майк</h5>
              <p className="card-text">
                Найден в Центральном районе. Рыжего окраса, среднего размера,
                очень дружелюбный.
              </p>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">Найден: 15.06.2025</small>
                <span className="badge bg-primary">Собака</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card h-100">
            <img
              src="img/pets/кошка_серая.jpg"
              className="card-img-top pet-card-img"
              alt="Found cat"
            />
            <div className="card-body">
              <h5 className="card-title">Кошка Митиса</h5>
              <p className="card-text">
                Найдена в Василеостровском районе. Пушистая, серая с белым,
                приучена к лотку.
              </p>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">Найдена: 12.06.2025</small>
                <span className="badge bg-primary">Кошка</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card h-100">
            <img
              src="img/pets/попугай.jpg"
              className="card-img-top pet-card-img"
              alt="Found parrot"
            />
            <div className="card-body">
              <h5 className="card-title">Попугай Филл</h5>
              <p className="card-text">
                Найден в Адмиралтейском районе. Волнистый попугай голубого
                окраса, умеет говорить несколько слов.
              </p>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">Найден: 10.06.2025</small>
                <span className="badge bg-primary">Птица</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center mt-4">
        <button
          className="btn btn-primary btn-animated"
          onclick="showPage('search')"
        >
          Смотреть все объявления
        </button>
      </div>
    </section>
    {/* Подписка на новости */}
    <section className="container mb-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card bg-light">
            <div className="card-body p-4 text-center">
              <h3 className="card-title">Подпишитесь на новости</h3>
              <p className="card-text">
                Получайте уведомления о новых найденных животных в вашем районе
              </p>
              <form
                className="row g-2 justify-content-center"
                id="subscription-form"
              >
                <div className="col-md-8">
                  <input
                    type="email"
                    className="form-control"
                    id="subscription-email"
                    placeholder="Ваш email"
                    required=""
                  />
                  <div className="invalid-feedback">
                    Пожалуйста, введите корректный email
                  </div>
                </div>
                <div className="col-md-4">
                  <button
                    type="submit"
                    className="btn btn-primary w-100 btn-animated"
                  >
                    Подписаться
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</div>
    );
}

export default Home;
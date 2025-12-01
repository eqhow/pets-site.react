import React from "react";
import '../assets/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Header(props) {
    return (
      <>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>FindPets - Найди своего питомца</title>

      {/* Контейнер для уведомлений об ошибках */}
      <div className="alert-container" id="alert-container" />
      {/* Навигация */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <a className="navbar-brand" href="#" onclick="showPage('home')">
            <i className="bi bi-house-heart-fill me-2" />
            FindPets
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            color="--"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link" href="#" onclick="showPage('search')">
                  Расширенный поиск
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#" onclick="showPage('add-pet')">
                  Добавить объявление
                </a>
              </li>
            </ul>
            <div className="d-flex align-items-center">
              <div className="input-group me-3 position-relative search-account-gap">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Быстрый поиск"
                  id="quick-search"
                />
                <button
                  className="btn btn-outline-primary search-btn-custom"
                  type="button"
                  onclick="performQuickSearch()"
                >
                  <i className="bi bi-search" />
                </button>
                <div className="quick-search-results" id="quick-search-results" />
              </div>
              <div className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-1" /> Аккаунт
                </a>
                <ul
                  className="dropdown-menu dropdown-menu-end"
                  id="account-dropdown"
                >
                  {/* Динамически заполняется в JavaScript */}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
    
    );
}

export default Header;

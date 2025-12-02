import React from "react";
import '../assets/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { Link } from "react-router-dom";

function Header(props) {
    return (
      <>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>FindPets - Найди своего питомца</title>

        <div className="alert-container" id="alert-container" />
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
          <div className="container">
            <Link className="navbar-brand" to="/">
              <i className="bi bi-house-heart-fill me-2" />
              FindPets
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <Link className="nav-link" to={'/advancedsearch'}> 
                    Расширенный поиск
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to={'/add-pet'}>
                    Добавить объявление
                  </Link>
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
                  >
                    <i className="bi bi-search" />
                  </button>
                  <div className="quick-search-results" id="quick-search-results" />
                </div>
                    <div class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle d-flex align-items-center show" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="true">
                            <i class="bi bi-person-circle me-1"></i> Аккаунт
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end show" id="account-dropdown" data-bs-popper="static">
                    <li><a class="dropdown-item">
                    <Link className="dropdown-item" class="bi bi-box-arrow-in-right me-2" to={'/sign-in'}> Вход </Link> </a> </li>
                    <li><a class="dropdown-item">
                    <Link className="dropdown-item" class="bi bi-person-plus me-2" to={'/registration'}> Регистрация </Link> </a> </li>
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
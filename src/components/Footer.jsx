import React from 'react';
import '../assets/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { Link } from 'react-router-dom';

function Footer(props) {
    return (
<footer className="text-white py-4">
  <div className="container">
    <div className="row">
      <div className="col-md-6">
        <h5>FindPets</h5>
        <p>Сервис для поиска потерянных домашних животных</p>
      </div>
      <div className="col-md-3">
        <h5>Навигация</h5>
        <ul className="list-unstyled">
          <li>
            <a href="#" className="text-white text-decoration-none"> </a>
            <Link className="text-white text-decoration-none" to={'/'}> Главная </Link>
          </li>
          <li>
            <Link className="text-white text-decoration-none" to={'/advancedsearch'}> Расширенный поиск </Link>
          </li>
          <li>
            <a href="#" className="text-white text-decoration-none" onclick="showPage('add-pet')"> </a>
          // здесь линк для добавить объявление        
          </li>
        </ul>
      </div>
      <div className="col-md-3">
        <h5>Контакты</h5>
        <ul className="list-unstyled">
          <li>
            <i className="bi bi-envelope me-2" />
            info@findpets.ru
          </li>
          <li>
            <i className="bi bi-telephone me-2" />
            +7 (911) 123-45-67
          </li>
        </ul>
      </div>
    </div>
    <hr className="my-3" />
    <div className="text-center">
      <p>© 2025 FindPets. Все права защищены.</p>
    </div>
  </div>
</footer>
    );
}

export default Footer;
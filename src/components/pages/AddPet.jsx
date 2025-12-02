import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from "react-router-dom";

function AddPet(props) {
    return (
        <div id="add-pet" className="page fade-in active-page">
  <div className="container my-5">
    <h2 className="section-title">Добавить объявление о найденном животном</h2>
    <div className="row justify-content-center">
      <div className="col-lg-10">
        <div className="card">
          <div className="card-body p-4">
            <form id="add-pet-form">
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="pet-name" className="form-label">
                    Ваше имя *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="pet-name"
                    required=""
                    pattern="[А-Яа-я\s\-]+"
                  />
                  <div className="invalid-feedback">
                    Имя должно содержать только кириллицу, пробелы и дефисы
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="pet-phone" className="form-label">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="pet-phone"
                    required=""
                    pattern="[\+\d]+"
                  />
                  <div className="invalid-feedback">
                    Телефон должен содержать только цифры и знак +
                  </div>
                </div>
                <div className="col-12">
                  <label htmlFor="pet-email" className="form-label">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="pet-email"
                    required=""
                  />
                  <div className="invalid-feedback">
                    Пожалуйста, введите корректный email
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="register-toggle"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="register-toggle"
                    >
                      Зарегистрироваться на сайте
                    </label>
                  </div>
                </div>
                <div
                  className="col-12"
                  id="password-fields"
                  style={{ display: "none" }}
                >
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="pet-password" className="form-label">
                        Пароль *
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="pet-password"
                        minLength={7}
                        pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,}$"
                      />
                      <div className="invalid-feedback">
                        Пароль должен содержать минимум 7 символов, включая 1
                        цифру, 1 строчную и 1 заглавную букву
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label
                        htmlFor="pet-password-confirm"
                        className="form-label"
                      >
                        Подтверждение пароля *
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="pet-password-confirm"
                      />
                      <div className="invalid-feedback">
                        Пароли не совпадают
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="pet-kind" className="form-label">
                    Вид животного *
                  </label>
                  <select className="form-select" id="pet-kind" required="">
                    <option value="">Выберите вид</option>
                    <option value="Собака">Собака</option>
                    <option value="Кошка">Кошка</option>
                    <option value="Птица">Птица</option>
                    <option value="Грызун">Грызун</option>
                    <option value="Рептилия">Рептилия</option>
                    <option value="Другое">Другое</option>
                  </select>
                  <div className="invalid-feedback">
                    Пожалуйста, выберите вид животного
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="pet-district" className="form-label">
                    Район, где найдено животное *
                  </label>
                  <select className="form-select" id="pet-district" required="">
                    <option value="">Выберите район</option>
                    <option value="Адмиралтейский">Адмиралтейский</option>
                    <option value="Василеостровский">Василеостровский</option>
                    <option value="Выборгский">Выборгский</option>
                    <option value="Калининский">Калининский</option>
                    <option value="Кировский">Кировский</option>
                    <option value="Колпинский">Колпинский</option>
                    <option value="Красногвардейский">Красногвардейский</option>
                    <option value="Красносельский">Красносельский</option>
                    <option value="Кронштадтский">Кронштадтский</option>
                    <option value="Курортный">Курортный</option>
                    <option value="Московский">Московский</option>
                    <option value="Невский">Невский</option>
                    <option value="Петроградский">Петроградский</option>
                    <option value="Петродворцовый">Петродворцовый</option>
                    <option value="Приморский">Приморский</option>
                    <option value="Пушкинский">Пушкинский</option>
                    <option value="Фрунзенский">Фрунзенский</option>
                    <option value="Центральный">Центральный</option>
                  </select>
                  <div className="invalid-feedback">
                    Пожалуйста, выберите район
                  </div>
                </div>
                <div className="col-12">
                  <label htmlFor="pet-mark" className="form-label">
                    Клеймо/Чип (если есть)
                  </label>
                  <input type="text" className="form-control" id="pet-mark" />
                </div>
                <div className="col-12">
                  <label htmlFor="pet-description" className="form-label">
                    Описание *
                  </label>
                  <textarea
                    className="form-control"
                    id="pet-description"
                    rows={4}
                    required=""
                    placeholder="Опишите животное: порода, окрас, особые приметы, поведение и т.д."
                    defaultValue={""}
                  />
                  <div className="invalid-feedback">
                    Пожалуйста, заполните описание
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label">Фотографии *</label>
                  <div className="mb-3">
                    <input
                      className="form-control"
                      type="file"
                      id="pet-photo1"
                      accept="image/png"
                      required=""
                    />
                    <div className="form-text">Основное фото (обязательно)</div>
                    <div className="invalid-feedback">
                      Пожалуйста, загрузите основное фото
                    </div>
                  </div>
                  <div className="mb-3">
                    <input
                      className="form-control"
                      type="file"
                      id="pet-photo2"
                      accept="image/png"
                    />
                    <div className="form-text">Дополнительное фото</div>
                  </div>
                  <div className="mb-3">
                    <input
                      className="form-control"
                      type="file"
                      id="pet-photo3"
                      accept="image/png"
                    />
                    <div className="form-text">Дополнительное фото</div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="pet-confirm"
                      required=""
                    />
                    <label className="form-check-label" htmlFor="pet-confirm">
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
                    className="btn btn-primary btn-lg w-100 btn-animated"
                  >
                    Добавить объявление
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

export default AddPet;
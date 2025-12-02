import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

function AdvancedSearch(props) {
    return (
        <>
        {/* Страница поиска животных */}
        <div id="search" className="page fade-in">
          <div className="container my-5">
            <h2 className="section-title">Расширенный поиск</h2>
            {/* Форма поиска */}
            <div className="card mb-4">
              <div className="card-body">
                <form id="search-form">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="district" className="form-label">
                        Район
                      </label>
                      <select className="form-select" id="district">
                        <option value="">Все районы</option>
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
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="kind" className="form-label">
                        Вид животного
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="kind"
                        placeholder="Например: кошка, собака"
                      />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary btn-animated">
                        <i className="bi bi-search me-2" />
                        Найти
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            {/* Блок с состоянием поиска */}
            <div id="search-state">
              {/* Изначально показываем приветственное сообщение */}
              <div className="text-center py-5" id="initial-state">
                <div className="mb-4">
                  <i className="bi bi-search display-1 text-muted" />
                </div>
                <h4 className="text-muted mb-3">Начните поиск животных</h4>
                <p className="text-muted">
                  Выберите район и/или укажите вид животного, чтобы увидеть результаты
                </p>
              </div>
              {/* Результаты поиска (изначально скрыты) */}
              <div id="search-results-container" style={{ display: "none" }}>
                <h3 className="mb-3">Результаты поиска</h3>
                <div className="row g-4" id="search-results">
                  {/* Результаты будут загружены здесь */}
                </div>
                {/* Пагинация */}
                <nav className="mt-5" id="pagination-container">
                  <ul className="pagination justify-content-center" id="pagination">
                    {/* Пагинация будет генерироваться здесь */}
                  </ul>
                </nav>
              </div>
              {/* Сообщение "Ничего не найдено" (изначально скрыто) */}
              <div
                className="text-center py-5"
                id="no-results-state"
                style={{ display: "none" }}
              >
                <div className="mb-4">
                  <i className="bi bi-search display-1 text-muted" />
                </div>
                <h4 className="text-muted mb-3">Ничего не найдено</h4>
                <p className="text-muted">Попробуйте изменить параметры поиска</p>
                <button
                  className="btn btn-outline-primary mt-3"
                  onclick="resetSearch()"
                >
                  <i className="bi bi-arrow-clockwise me-2" />
                  Сбросить фильтры
                </button>
              </div>
            </div>
          </div>
        </div>
      </>      
    );
}

export default AdvancedSearch;
// AdvancedSearch.jsx
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AuthContext, PetsContext, AlertContext } from '../../App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import { api } from '../../api';

function AdvancedSearch() {
  const { 
    filteredPets, 
    filters, 
    pagination, 
    filterPets, 
    resetFilters, 
    setCurrentPage,
    loadPets
  } = useContext(PetsContext);
  
  const { showAlert } = useContext(AlertContext);
  
  // Локальное состояние формы
  const [formValues, setFormValues] = useState({
    district: filters.district || '',
    kind: filters.kind || ''
  });

  const [loading, setLoading] = useState(false);

  // Обработчик изменения формы
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await filterPets(formValues);
    } catch (error) {
      showAlert('Ошибка поиска', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик сброса
  const handleReset = () => {
    setFormValues({ district: '', kind: '' });
    resetFilters();
  };

  // Расчет отображаемых животных с пагинацией
  const displayedPets = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredPets.slice(startIndex, endIndex);
  }, [filteredPets, pagination]);

  // Расчет пагинации
  const totalPages = Math.ceil(filteredPets.length / pagination.itemsPerPage);

  return (
    <div id="search" className="page fade-in">
      <div className="container my-5">
        <h2 className="section-title">Расширенный поиск</h2>
        
        {/* Форма поиска */}
        <div className="card mb-4">
          <div className="card-body">
            <form id="search-form" onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="district" className="form-label">
                    Район
                  </label>
                  <select 
                    className="form-select" 
                    id="district"
                    value={formValues.district}
                    onChange={handleInputChange}
                  >
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
                    value={formValues.kind}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-12">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-animated me-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Поиск...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search me-2" />
                        Найти
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-primary"
                    onClick={handleReset}
                  >
                    Сбросить
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Блок с состоянием поиска */}
        <div id="search-state">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
            </div>
          ) : filteredPets.length === 0 && !formValues.district && !formValues.kind ? (
            <div className="text-center py-5" id="initial-state">
              <div className="mb-4">
                <i className="bi bi-search display-1 text-muted" />
              </div>
              <h4 className="text-muted mb-3">Начните поиск животных</h4>
              <p className="text-muted">
                Выберите район и/или укажите вид животного, чтобы увидеть результаты
              </p>
            </div>
          ) : filteredPets.length === 0 ? (
            <div className="text-center py-5" id="no-results-state">
              <div className="mb-4">
                <i className="bi bi-search display-1 text-muted" />
              </div>
              <h4 className="text-muted mb-3">Ничего не найдено</h4>
              <p className="text-muted">Попробуйте изменить параметры поиска</p>
              <button
                className="btn btn-outline-primary mt-3"
                onClick={handleReset}
              >
                <i className="bi bi-arrow-clockwise me-2" />
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div id="search-results-container">
              <h3 className="mb-3">Результаты поиска ({filteredPets.length})</h3>
              <div className="row g-4" id="search-results">
                {displayedPets.map(pet => (
                  <div className="col-md-6 col-lg-4" key={pet.id}>
                    <div className="card h-100">
                      <img
                        src={pet.image || pet.photos?.[0] || 'https://via.placeholder.com/300x200'}
                        className="card-img-top pet-card-img"
                        alt={pet.kind}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{pet.kind}</h5>
                        <p className="card-text">{pet.description}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">Найден: {pet.date}</small>
                          <span className="badge bg-primary">{pet.district}</span>
                        </div>
                      </div>
                      <div className="card-footer bg-transparent">
                        <Link 
                          to={`/pet/${pet.id}`}
                          className="btn btn-outline-primary btn-sm w-100 btn-animated"
                        >
                          Подробнее
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Пагинация */}
              {totalPages > 1 && (
                <nav className="mt-5" id="pagination-container">
                  <ul className="pagination justify-content-center" id="pagination">
                    <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                      >
                        Предыдущая
                      </button>
                    </li>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <li 
                          key={pageNumber}
                          className={`page-item ${pagination.currentPage === pageNumber ? 'active' : ''}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        </li>
                      );
                    })}
                    
                    <li className={`page-item ${pagination.currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === totalPages}
                      >
                        Следующая
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdvancedSearch;
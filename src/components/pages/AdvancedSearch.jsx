// AdvancedSearch.jsx
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AuthContext, PetsContext, AlertContext } from '../../App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../../api';

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

  // Функция для отображения ограниченного количества страниц
  const getPaginationItems = () => {
    const items = [];
    const maxVisible = 5; // Максимальное количество видимых страниц
    
    if (totalPages <= maxVisible) {
      // Если страниц мало, показываем все
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Логика для ограниченного отображения
      const leftSibling = Math.max(pagination.currentPage - 1, 1);
      const rightSibling = Math.min(pagination.currentPage + 1, totalPages);
      
      const shouldShowLeftDots = leftSibling > 2;
      const shouldShowRightDots = rightSibling < totalPages - 1;
      
      // Первая страница
      items.push(1);
      
      if (shouldShowLeftDots) {
        items.push('...');
      }
      
      // Страницы вокруг текущей
      for (let i = leftSibling; i <= rightSibling; i++) {
        if (i > 1 && i < totalPages) {
          items.push(i);
        }
      }
      
      if (shouldShowRightDots) {
        items.push('...');
      }
      
      // Последняя страница
      if (totalPages > 1) {
        items.push(totalPages);
      }
    }
    
    return items;
  };

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
                {displayedPets.map(pet => {
                  const imageUrl = getImageUrl(pet.image) || 
                                 (pet.photos && pet.photos.length > 0 ? getImageUrl(pet.photos[0]) : null) ||
                                 'https://via.placeholder.com/300x200?text=Нет+фото';
                  
                  return (
                    <div className="col-md-6 col-lg-4" key={pet.id}>
                      <div className="card h-100">
                        <img
                          src={imageUrl}
                          className="card-img-top pet-card-img"
                          alt={pet.kind}
                          style={{ height: "200px", objectFit: "cover" }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=Нет+фото';
                          }}
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
                  );
                })}
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
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    
                    {getPaginationItems().map((item, index) => (
                      item === '...' ? (
                        <li key={`dots-${index}`} className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      ) : (
                        <li 
                          key={item}
                          className={`page-item ${pagination.currentPage === item ? 'active' : ''}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(item)}
                          >
                            {item}
                          </button>
                        </li>
                      )
                    ))}
                    
                    <li className={`page-item ${pagination.currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === totalPages}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                  <div className="text-center text-muted mt-2">
                    Страница {pagination.currentPage} из {totalPages}
                  </div>
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
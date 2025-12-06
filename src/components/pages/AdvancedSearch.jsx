// AdvancedSearch.jsx
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { PetsContext, AlertContext } from '../../App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import PetCard from '../PetCard';

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
  const [hasSearched, setHasSearched] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [localSearchResults, setLocalSearchResults] = useState([]);
  const [localCurrentPage, setLocalCurrentPage] = useState(1);

  // При монтировании НЕ загружаем животных сразу
  useEffect(() => {
    setInitialLoad(false);
  }, []);

  // Синхронизируем formValues с фильтрами из контекста
  useEffect(() => {
    setFormValues({
      district: filters.district || '',
      kind: filters.kind || ''
    });
  }, [filters]);

  // Когда изменяются filteredPets в контексте, обновляем локальные результаты
  useEffect(() => {
    if (hasSearched && filteredPets.length > 0) {
      setLocalSearchResults(filteredPets);
      setLocalCurrentPage(1); // Сбрасываем на первую страницу при новом поиске
    }
  }, [filteredPets, hasSearched]);

  // Функция для подготовки данных для PetCard
  const preparePetForCard = (pet) => {
    if (!pet) return pet;
    
    const preparedPet = { ...pet };
    
    if (!preparedPet.kind && preparedPet.type) {
      preparedPet.kind = preparedPet.type;
    }
    
    if (!preparedPet.description && preparedPet.short_description) {
      preparedPet.description = preparedPet.short_description;
    }
    
    if (!preparedPet.date && preparedPet.created_at) {
      preparedPet.date = preparedPet.created_at;
    }
    
    return preparedPet;
  };

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
      // Сначала загружаем животных, если они еще не загружены
      await loadPets();
      
      // Затем применяем фильтры
      await filterPets(formValues);
      setHasSearched(true);
    } catch (error) {
      showAlert('Ошибка поиска: ' + error.message, 'danger');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик сброса
  const handleReset = () => {
    setFormValues({ district: '', kind: '' });
    setHasSearched(false);
    setLocalSearchResults([]);
    setLocalCurrentPage(1);
    resetFilters();
  };

  // Обработчик изменения страницы
  const handlePageChange = (page) => {
    setLocalCurrentPage(page);
    // Прокручиваем к началу страницы
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Расчет отображаемых животных с пагинацией
  const itemsPerPage = 6;
  const displayedPets = useMemo(() => {
    const startIndex = (localCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return localSearchResults
      .slice(startIndex, endIndex)
      .map(pet => preparePetForCard(pet));
  }, [localSearchResults, localCurrentPage]);

  // Расчет пагинации
  const totalPages = Math.ceil(localSearchResults.length / itemsPerPage);

  // Функция для отображения ограниченного количества страниц
  const getPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      const leftSibling = Math.max(localCurrentPage - 1, 1);
      const rightSibling = Math.min(localCurrentPage + 1, totalPages);
      
      const shouldShowLeftDots = leftSibling > 2;
      const shouldShowRightDots = rightSibling < totalPages - 1;
      
      items.push(1);
      
      if (shouldShowLeftDots) {
        items.push('...');
      }
      
      for (let i = leftSibling; i <= rightSibling; i++) {
        if (i > 1 && i < totalPages) {
          items.push(i);
        }
      }
      
      if (shouldShowRightDots) {
        items.push('...');
      }
      
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
                    disabled={loading}
                  >
                    Сброс
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
              <p className="mt-3">Загрузка...</p>
            </div>
          ) : initialLoad ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
              <p className="mt-3">Загрузка...</p>
            </div>
          ) : !hasSearched ? (
            // Изначальное состояние - когда еще не было поиска
            <div className="text-center py-5" id="initial-state">
              <div className="mb-4">
                <i className="bi bi-search display-1 text-muted" />
              </div>
              <h4 className="text-muted mb-3">Начните поиск животных</h4>
              <p className="text-muted">
                Выберите район и/или укажите вид животного, чтобы увидеть результаты
              </p>
            </div>
          ) : localSearchResults.length === 0 ? (
            // Результатов не найдено после поиска
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
            // Есть результаты поиска
            <div id="search-results-container">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0">Найдено животных: {localSearchResults.length}</h3>
                <div className="text-muted">
                  Страница {localCurrentPage} из {totalPages}
                </div>
              </div>
              
              <div className="row g-4" id="search-results">
                {displayedPets.map(pet => {
                  if (!pet || !pet.id) {
                    console.warn('Пропущен питомец без id:', pet);
                    return null;
                  }
                  
                  return (
                    <PetCard 
                      key={pet.id} 
                      pet={pet}
                      noBorder={false}
                      animatedButton={true}
                    />
                  );
                })}
              </div>

              {/* Пагинация */}
              {totalPages > 1 && (
                <nav className="mt-5" id="pagination-container">
                  <ul className="pagination justify-content-center" id="pagination">
                    <li className={`page-item ${localCurrentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(localCurrentPage - 1)}
                        disabled={localCurrentPage === 1}
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
                          className={`page-item ${localCurrentPage === item ? 'active' : ''}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(item)}
                          >
                            {item}
                          </button>
                        </li>
                      )
                    ))}
                    
                    <li className={`page-item ${localCurrentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(localCurrentPage + 1)}
                        disabled={localCurrentPage === totalPages}
                      >
                        <i className="bi bi-chevron-right"></i>
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
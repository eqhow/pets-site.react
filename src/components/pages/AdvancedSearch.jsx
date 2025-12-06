// AdvancedSearch.jsx
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { PetsContext, AlertContext } from '../../App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { getImageUrl } from '../../api'; // Добавляем getImageUrl обратно
import PetCard from '../PetCard';

debugger;

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

  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  // При монтировании загружаем всех питомцев если еще не загружены
  useEffect(() => {
    const loadInitialData = async () => {
      if (filteredPets.length === 0) {
        try {
          await loadPets();
        } catch (error) {
          showAlert('Ошибка загрузки данных', 'danger');
        }
      }
      setLoading(false);
    };
    
    loadInitialData();
  }, [filteredPets.length, loadPets, showAlert]);

  // Синхронизируем formValues с фильтрами из контекста
  useEffect(() => {
    setFormValues({
      district: filters.district || '',
      kind: filters.kind || ''
    });
  }, [filters]);

  // Функция для подготовки данных для PetCard (аналогично тому, что в Home.jsx)
  const preparePetForCard = (pet) => {
    if (!pet) return pet;
    
    // Создаем копию, чтобы не мутировать оригинал
    const preparedPet = { ...pet };
    
    // Убеждаемся, что есть все необходимые поля для PetCard
    // PetCard использует: id, kind, description, date, district, photo, photos
    
    // Преобразуем данные как в PetCard
    if (!preparedPet.kind && preparedPet.type) {
      preparedPet.kind = preparedPet.type;
    }
    
    if (!preparedPet.description && preparedPet.short_description) {
      preparedPet.description = preparedPet.short_description;
    }
    
    if (!preparedPet.date && preparedPet.created_at) {
      preparedPet.date = preparedPet.created_at;
    }
    
    // ВАЖНО: Не обрабатываем photo и photos здесь! 
    // PetCard сам вызовет getImageUrl() для этих полей
    
    // Проверяем, что поля photo/photos есть и это строки
    // Если их нет, PetCard сам использует заглушку
    if (preparedPet.photo && typeof preparedPet.photo !== 'string') {
      console.warn('Некорректный формат photo для питомца:', pet.id, pet.photo);
      delete preparedPet.photo; // Удаляем некорректное поле
    }
    
    if (preparedPet.photos && !Array.isArray(preparedPet.photos)) {
      console.warn('Некорректный формат photos для питомца:', pet.id, pet.photos);
      delete preparedPet.photos; // Удаляем некорректное поле
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
    setHasSearched(true);
    
    try {
      await filterPets(formValues);
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
    resetFilters();
  };

  // Расчет отображаемых животных с пагинацией
  const displayedPets = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredPets
      .slice(startIndex, endIndex)
      .map(pet => preparePetForCard(pet)); // Подготавливаем данные
  }, [filteredPets, pagination]);

  // Расчет пагинации
  const totalPages = Math.ceil(filteredPets.length / pagination.itemsPerPage);

  // Функция для отображения ограниченного количества страниц
  const getPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      const leftSibling = Math.max(pagination.currentPage - 1, 1);
      const rightSibling = Math.min(pagination.currentPage + 1, totalPages);
      
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

  // Отладочный вывод
  useEffect(() => {
    if (displayedPets.length > 0) {
      const firstPet = displayedPets[0];
      console.log('Проверка данных питомца:', {
        id: firstPet.id,
        kind: firstPet.kind,
        photo: firstPet.photo,
        photos: firstPet.photos,
        // Тестируем getImageUrl с этими данными
        getImageUrlTest: firstPet.photo ? getImageUrl(firstPet.photo) : 'Нет photo'
      });
    }
  }, [displayedPets]);

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
              <p className="mt-3">Загрузка...</p>
            </div>
          ) : !hasSearched && filteredPets.length === 0 ? (
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
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0">Результаты поиска ({filteredPets.length})</h3>
                {(filters.district || filters.kind) && (
                  <div className="alert alert-info py-2 mb-0">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-funnel me-2"></i>
                      <div>
                        <strong>Фильтры:</strong>
                        {filters.district && (
                          <span className="badge bg-primary ms-2">Район: {filters.district}</span>
                        )}
                        {filters.kind && (
                          <span className="badge bg-primary ms-2">Вид: {filters.kind}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
                    <div className="small">
                      Показано {displayedPets.length} из {filteredPets.length} животных
                    </div>
                  </div>
                </nav>
              )}
              
              {/* Кнопка сброса если есть активные фильтры */}
              {(filters.district || filters.kind) && (
                <div className="text-center mt-4">
                  <button
                    className="btn btn-outline-primary"
                    onClick={handleReset}
                  >
                    <i className="bi bi-x-circle me-2" />
                    Сбросить все фильтры
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdvancedSearch;
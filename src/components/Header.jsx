import React, { useState, useContext, useEffect, useRef, useCallback } from "react";
import { AuthContext, PetsContext } from '../App';
import '../assets/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link, useNavigate } from "react-router-dom";
import { NavDropdown } from 'react-bootstrap';
import { api } from '../api';

function Header() {
  const { isLoggedIn, user, logoutUser } = useContext(AuthContext);
  const { filterPets } = useContext(PetsContext);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  // Локальное состояние для подсказок
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Функция для получения подсказок с API
  const fetchSuggestions = useCallback(async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.autocomplete(query);
      
      // Обрабатываем разные форматы ответа
      let suggestionsList = [];
      
      if (response.data?.suggestions) {
        suggestionsList = response.data.suggestions;
      } else if (response.data?.keywords) {
        suggestionsList = response.data.keywords;
      } else if (Array.isArray(response.data)) {
        suggestionsList = response.data;
      } else if (Array.isArray(response)) {
        suggestionsList = response;
      } else if (response.data?.kinds) {
        // Если API возвращает виды животных
        suggestionsList = response.data.kinds;
      }
      
      // Если API не поддерживает автодополнение, создаем фиктивные подсказки
      if (suggestionsList.length === 0) {
        suggestionsList = generateMockSuggestions(query);
      }
      
      setSuggestions(suggestionsList.slice(0, 8)); // Ограничиваем 8 подсказками
      setShowSuggestions(true);
      setSelectedIndex(-1); // Сбрасываем выделение
    } catch (error) {
      console.error('Ошибка получения подсказок:', error);
      // Если endpoint не работает, используем моковые данные
      const mockSuggestions = generateMockSuggestions(query);
      setSuggestions(mockSuggestions.slice(0, 8));
      setShowSuggestions(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Генерация моковых подсказок (если API не работает)
  const generateMockSuggestions = (query) => {
    const baseSuggestions = [
      "кошка",
      "кошка красивая", 
      "кошка породистая",
      "кошка шотландская",
      "кот",
      "котенок",
      "кот персидский",
      "собака",
      "собака овчарка",
      "щенок",
      "попугай",
      "хомяк",
      "кролик",
      "шиншилла",
      "морская свинка",
      "крыса",
      "мышь",
      "черепаха",
      "рыбки",
      "птица"
    ];
    
    const queryLower = query.toLowerCase();
    return baseSuggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(queryLower)
    );
  };

  // Обработчик ввода с debounce
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchSuggestions(searchTerm);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, fetchSuggestions]);

  // Закрытие подсказок при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Обработка клавиш для навигации по подсказкам
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          // Выбираем подсказку
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else if (searchTerm.trim()) {
          // Ищем по введенному тексту
          handleSearch();
        }
        break;
        
      case 'Escape':
        setShowSuggestions(false);
        break;
      default:
        // Обработка других клавиш не требуется
        break;
    }
  };

  // Выбор подсказки
  const handleSuggestionSelect = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    // Фокусируемся обратно на инпут для продолжения ввода или поиска
    inputRef.current?.focus();
  };

  // Поиск по выбранному тексту
  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    filterPets({ kind: searchTerm });
    navigate('/advancedsearch');
    setShowSuggestions(false);
    setSearchTerm("");
  };

  // Обработчик выхода
  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      logoutUser();
      navigate('/');
    }
  };

  return (
    <>
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
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/advancedsearch">
                  Расширенный поиск
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/add-pet">
                  Добавить объявление
                </Link>
              </li>
            </ul>
            <div className="d-flex align-items-center">
              <div className="input-group me-3 position-relative search-account-gap" ref={searchRef}>
                <input
                  ref={inputRef}
                  type="text"
                  className="form-control"
                  placeholder="Быстрый поиск"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => {
                    if (searchTerm.trim() && suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="btn btn-outline-primary search-btn-custom"
                  type="button"
                  onClick={handleSearch}
                >
                  <i className="bi bi-search" />
                </button>
                
                {/* Подсказки */}
                {showSuggestions && (
                  <div className="autocomplete-suggestions" style={{ display: 'block' }}>
                    {isLoading ? (
                      <div className="suggestion-item text-center">
                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                        <small>Загрузка подсказок...</small>
                      </div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                          onClick={() => handleSuggestionSelect(suggestion)}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          <i className="bi bi-search me-2 text-muted"></i>
                          <span>{suggestion}</span>
                        </div>
                      ))
                    ) : (
                      <div className="suggestion-item text-center text-muted">
                        <small>Нет подсказок</small>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Аккаунт */}
              <NavDropdown 
                title={
                  <span>
                    <i className="bi bi-person-circle me-1"></i> Аккаунт
                  </span>
                }
                id="navbarDropdown"
                align="end"
                className="nav-item"
                menuVariant="light"
              >
                {isLoggedIn ? (
                  <>
                    <NavDropdown.Header>Здравствуйте, {user?.name}!</NavDropdown.Header>
                    <NavDropdown.Divider />
                    <NavDropdown.Item as={Link} to="/profile">
                      <i className="bi bi-person me-2"></i>Профиль
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item 
                      className="logout-item"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>Выйти из аккаунта
                    </NavDropdown.Item>
                  </>
                ) : (
                  <>
                    <NavDropdown.Item as={Link} to="/sign-in">
                      <i className="bi bi-box-arrow-in-right me-2"></i> Вход
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/registration">
                      <i className="bi bi-person-plus me-2"></i> Регистрация
                    </NavDropdown.Item>
                  </>
                )}
              </NavDropdown>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Header;
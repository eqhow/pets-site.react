
import React, { useState, useContext, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // обязательно для bootstrap JS API
import { AuthContext, PetsContext } from "../App";
import "../assets/css/style.css";
import { api } from "../api";

function Header() {
  const { isLoggedIn, user, logoutUser } = useContext(AuthContext);
  const { filterPets } = useContext(PetsContext);
  const navigate = useNavigate();

  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // --- автокомплит ---
  const fetchSuggestions = useCallback(async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.autocomplete(query);

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
        suggestionsList = response.data.kinds;
      }

      if (suggestionsList.length === 0) {
        suggestionsList = generateMockSuggestions(query);
      }

      setSuggestions(suggestionsList.slice(0, 8));
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Ошибка получения подсказок:", error);
      const mockSuggestions = generateMockSuggestions(query);
      setSuggestions(mockSuggestions.slice(0, 8));
      setShowSuggestions(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      "птица",
    ];

    const queryLower = query.toLowerCase();
    return baseSuggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(queryLower)
    );
  };

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (searchTerm.trim()) fetchSuggestions(searchTerm);
      else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [searchTerm, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else if (searchTerm.trim()) {
          handleSearch();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    filterPets({ kind: searchTerm });
    navigate("/advancedsearch");
    setShowSuggestions(false);
    setSearchTerm("");
    // закрываем navbar на мобилках после поиска
    closeNavbar();
  };

  // --- закрытие navbar (работает через Bootstrap API) ---
  const closeNavbar = () => {
    const nav = document.getElementById("navbarNav");
    if (!nav) return;

    // если bootstrap доступен в window — используем API
    const bs = window.bootstrap;
    try {
      if (bs && bs.Collapse) {
        const instance = bs.Collapse.getInstance(nav) || new bs.Collapse(nav, { toggle: false });
        instance.hide();
        return;
      }
    } catch (err) {
      // ignore и fallback ниже
      console.warn("bootstrap collapse api error:", err);
    }

    // fallback: просто убрать класс show (не самый аккуратный, но работает)
    if (nav.classList.contains("show")) {
      nav.classList.remove("show");
    }
  };

  const handleNavLinkClick = () => {
    // закрываем меню при клике на любые ссылки
    closeNavbar();
  };

  const handleLogout = () => {
    if (window.confirm("Вы уверены, что хотите выйти?")) {
      logoutUser();
      navigate("/");
      closeNavbar();
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <Link className="navbar-brand" to="/" onClick={handleNavLinkClick}>
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
                <Link
                  className="nav-link"
                  to="/advancedsearch"
                  onClick={handleNavLinkClick}
                >
                  Расширенный поиск
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="/add-pet"
                  onClick={handleNavLinkClick}
                >
                  Добавить объявление
                </Link>
              </li>
            </ul>

            <div className="d-flex align-items-center">
              <div
                className="input-group me-3 position-relative search-account-gap"
                ref={searchRef}
              >
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

                {showSuggestions && (
                  <div
                    className="autocomplete-suggestions"
                    style={{ display: "block" }}
                  >
                    {isLoading ? (
                      <div className="suggestion-item text-center">
                        <div
                          className="spinner-border spinner-border-sm text-primary me-2"
                          role="status"
                        />
                        <small>Загрузка подсказок...</small>
                      </div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className={`suggestion-item ${
                            index === selectedIndex ? "selected" : ""
                          }`}
                          onClick={() => handleSuggestionSelect(suggestion)}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          <i className="bi bi-search me-2 text-muted" />
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

              <NavDropdown
                title={
                  <span>
                    <i className="bi bi-person-circle me-1" /> Аккаунт
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
                    <NavDropdown.Item
                      as={Link}
                      to="/profile"
                      onClick={() => {
                        handleNavLinkClick();
                      }}
                    >
                      <i className="bi bi-person me-2" />
                      Профиль
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item
                      className="logout-item"
                      onClick={() => {
                        handleLogout();
                      }}
                    >
                      <i className="bi bi-box-arrow-right me-2" />
                      Выйти из аккаунта
                    </NavDropdown.Item>
                  </>
                ) : (
                  <>
                    <NavDropdown.Item
                      as={Link}
                      to="/sign-in"
                      onClick={handleNavLinkClick}
                    >
                      <i className="bi bi-box-arrow-in-right me-2" /> Вход
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      as={Link}
                      to="/registration"
                      onClick={handleNavLinkClick}
                    >
                      <i className="bi bi-person-plus me-2" /> Регистрация
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
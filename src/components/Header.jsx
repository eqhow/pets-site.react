import React, { useState, useContext, useEffect } from "react";
import { AuthContext, PetsContext, AlertContext } from '../App';
import '../assets/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link, useNavigate } from "react-router-dom";
import { NavDropdown } from 'react-bootstrap';

function Header() {
  const { isLoggedIn, user, logoutUser } = useContext(AuthContext);
  const { allPets, filterPets } = useContext(PetsContext);
  const { showAlert } = useContext(AlertContext);
  const navigate = useNavigate();

  // Локальное состояние для быстрого поиска
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Обработчик быстрого поиска
  const handleQuickSearch = () => {
    if (!searchTerm.trim()) {
      setShowResults(false);
      return;
    }

    const filtered = allPets.filter(pet =>
      pet.kind.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.district.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSearchResults(filtered.slice(0, 5));
    setShowResults(true);
  };

  // Обработчик ввода в поиск
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleQuickSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Переход на страницу расширенного поиска
  const handleAdvancedSearch = () => {
    if (searchTerm.trim()) {
      filterPets({ kind: searchTerm });
      navigate('/advancedsearch');
      setShowResults(false);
    }
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
              <div className="input-group me-3 position-relative search-account-gap">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Быстрый поиск"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => searchTerm.trim() && setShowResults(true)}
                />
                <button
                  className="btn btn-outline-primary search-btn-custom"
                  type="button"
                  onClick={handleQuickSearch}
                >
                  <i className="bi bi-search" />
                </button>
                {showResults && searchResults.length > 0 && (
                  <div className="quick-search-results" style={{ display: 'block' }}>
                    {searchResults.map(pet => (
                      <div
                        key={pet.id}
                        className="quick-search-item"
                        onClick={() => {
                          navigate(`/pet/${pet.id}`);
                          setShowResults(false);
                        }}
                      >
                        <img src={pet.image} alt={pet.kind} />
                        <div className="quick-search-item-info">
                          <div className="quick-search-item-title">{pet.kind}</div>
                          <div className="quick-search-item-meta">{pet.district} • {pet.date}</div>
                        </div>
                      </div>
                    ))}
                    {allPets.filter(pet =>
                      pet.kind.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      pet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      pet.district.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length > 5 && (
                      <div
                        className="quick-search-item text-center"
                        onClick={handleAdvancedSearch}
                      >
                        <small className="text-primary">
                          Показать все результаты ({
                            allPets.filter(pet =>
                              pet.kind.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              pet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              pet.district.toLowerCase().includes(searchTerm.toLowerCase())
                            ).length
                          })
                        </small>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Используем React Bootstrap Dropdown без стрелки */}
              <NavDropdown 
                title={
                  <span>
                    <i className="bi bi-person-circle me-1"></i> Аккаунт
                  </span>
                }
                id="navbarDropdown"
                align="end"
                // Стили для удаления стрелки
                className="nav-item"
                menuVariant="light"
              >
                {isLoggedIn ? (
                  <>
                    <NavDropdown.Header>Здравствуйте, {user.name}!</NavDropdown.Header>
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
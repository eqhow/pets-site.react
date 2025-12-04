import React, { useState, useContext, useEffect } from 'react';
import { PetsContext, AlertContext } from '../../App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from "react-router-dom";
import { api, getImageUrl } from '../../api';

function Home() {
  const { sliderPets, allPets, loadPets } = useContext(PetsContext);
  const { showAlert } = useContext(AlertContext);
  const [recentPets, setRecentPets] = useState([]);
  
  // Состояние для подписки
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  

  // Получаем последние 6 животных
  useEffect(() => {
    if (allPets.length > 0) {
      const sorted = [...allPets]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6);
      setRecentPets(sorted);
    }
  }, [allPets]);

  // Обработчик подписки
  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setEmailError("Пожалуйста, введите email");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Пожалуйста, введите корректный email");
      return;
    }
    
    try {
      await api.subscribe({ email });
      showAlert("Вы успешно подписались на новости!", "success");
      setEmail("");
      setEmailError("");
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  };

  // Если нет слайдера, показываем заглушку
  const hasSlider = sliderPets && sliderPets.length > 0;

  return (
    <div className="main-content">
      <div id="home" className="page active-page fade-in">
        {/* Слайдер с успешными историями */}
        <br />
        <section className="container mb-5">
          <h2 className="section-title">Недавно вернулись домой</h2>
          {hasSlider ? (
            <div
              id="successStoriesCarousel"
              className="carousel slide"
              data-bs-ride="carousel"
            >
              <div className="carousel-indicators">
                {sliderPets.map((story, index) => (
                  <button
                    key={story.id}
                    type="button"
                    data-bs-target="#successStoriesCarousel"
                    data-bs-slide-to={index}
                    className={index === 0 ? "active" : ""}
                    aria-current={index === 0 ? "true" : "false"}
                    aria-label={`Slide ${index + 1}`}
                  ></button>
                ))}
              </div>
              <div className="carousel-inner rounded-3">
                {sliderPets.map((story, index) => {
                  const imageUrl = getImageUrl(story.image) || 
                                 (story.photos && story.photos.length > 0 ? getImageUrl(story.photos[0]) : null) ||
                                 'https://via.placeholder.com/800x400?text=Нет+фото';
                  
                  return (
                    <div 
                      key={story.id} 
                      className={`carousel-item ${index === 0 ? "active" : ""}`}
                    >
                      <img
                        src={imageUrl}
                        className="d-block w-100"
                        alt={story.kind}
                        style={{ height: "400px", objectFit: "cover" }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/800x400?text=Нет+фото';
                        }}
                      />
                      <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded-3 p-3">
                        <h5>{story.kind}</h5>
                        <p>{story.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#successStoriesCarousel"
                data-bs-slide="prev"
              >
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Предыдущий</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#successStoriesCarousel"
                data-bs-slide="next"
              >
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Следующий</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-5 bg-light rounded-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
            </div>
          )}
        </section>
        
        {/* Карточки недавно найденных животных */}
        <section className="container mb-5">
          <h2 className="section-title">Их ждут дома</h2>
          <div className="row g-4">
            {recentPets.map(pet => {
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
                    <div className="card-footer bg-transparent border-0">
                      <Link 
                        to={`/pet/${pet.id}`} 
                        className="btn btn-outline-primary btn-sm w-100"
                      >
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-4">
            <Link className="btn btn-primary btn-animated" to="/advancedsearch">
              Смотреть все объявления
            </Link>
          </div>
        </section>

        {/* Подписка на новости */}
        <section className="container mb-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card bg-light">
                <div className="card-body p-4 text-center">
                  <h3 className="card-title">Подпишитесь на новости</h3>
                  <p className="card-text">
                    Получайте уведомления о новых найденных животных в вашем районе
                  </p>
                  <form
                    className="row g-2 justify-content-center"
                    onSubmit={handleSubscribe}
                    noValidate
                  >
                    <div className="col-md-8">
                      <input
                        type="email"
                        className={`form-control ${emailError ? 'is-invalid' : ''}`}
                        placeholder="Ваш email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError("");
                        }}
                        required
                      />
                      {emailError && (
                        <div className="invalid-feedback">{emailError}</div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <button
                        type="submit"
                        className="btn btn-primary w-100 btn-animated"
                      >
                        Подписаться
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
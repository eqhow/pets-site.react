import React, { useState, useContext, useEffect } from 'react';
import { PetsContext, AlertContext } from '../../App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from "react-router-dom";
import { api, getImageUrl } from '../../api';
import PetCard from '../PetCard';

function Home() {
  const { sliderPets, allPets } = useContext(PetsContext);
  const { showAlert } = useContext(AlertContext);
  const [recentPets, setRecentPets] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  
  // Состояние для подписки
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  // Загружаем недавние животные
  useEffect(() => {
    const fetchRecentPets = async () => {
      setLoadingRecent(true);
      try {
        const response = await api.getPets();
        const allPetsData = response.data?.orders || [];
        
        const sorted = [...allPetsData]
          .sort((a, b) => {
            try {
              const dateA = new Date(b.created_at || b.date || 0);
              const dateB = new Date(a.created_at || a.date || 0);
              return dateB - dateA;
            } catch {
              return 0;
            }
          })
          .slice(0, 6);
        
        setRecentPets(sorted);
      } catch (error) {
        showAlert('Ошибка загрузки последних объявлений', 'danger');
      } finally {
        setLoadingRecent(false);
      }
    };
    
    if (allPets.length === 0) {
      fetchRecentPets();
    } else {
      const sorted = [...allPets]
        .sort((a, b) => {
          try {
            const dateA = new Date(b.created_at || b.date || 0);
            const dateB = new Date(a.created_at || a.date || 0);
            return dateB - dateA;
          } catch {
            return 0;
          }
        })
        .slice(0, 6);
      setRecentPets(sorted);
    }
  }, [allPets, showAlert]);

  // Обработчик подписки - ИСПРАВЛЕННАЯ ВЕРСИЯ
  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    // Валидация на клиенте
    if (!email.trim()) {
      setEmailError("Пожалуйста, введите email");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Пожалуйста, введите корректный email");
      return;
    }
    
    // Очищаем предыдущие ошибки
    setEmailError("");
    setIsSubscribing(true);
    
    try {
      // Подготавливаем данные для отправки
      const emailData = {
        email: email.trim().toLowerCase() // Приводим к нижнему регистру
      };
      
      console.log('Отправка подписки:', emailData);
      
      // Отправляем запрос через API
      await api.subscribe(emailData);
      
      showAlert("Вы успешно подписались на новости!", "success");
      setEmail("");
      setEmailError("");
    } catch (error) {
      console.error('Ошибка при подписке:', error);
      
      // Парсим сообщение об ошибке
      let errorMessage = error.message || 'Произошла ошибка при подписке';
      
      // Если ошибка валидации email от сервера
      if (error.message && error.message.includes('email')) {
        errorMessage = "Пожалуйста, введите корректный email адрес";
      } else if (error.message && error.message.includes('уже подписан')) {
        errorMessage = "Этот email уже подписан на рассылку";
      }
      
      setEmailError(errorMessage);
      showAlert(errorMessage, 'danger');
    } finally {
      setIsSubscribing(false);
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
                        <p>{story.description || story.short_description}</p>
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
          {loadingRecent ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {recentPets.map(pet => (
                  <PetCard 
                    key={pet.id} 
                    pet={pet}
                    noBorder={true}
                    animatedButton={false}
                  />
                ))}
              </div>
              <div className="text-center mt-4">
                <Link className="btn btn-primary btn-animated" to="/advancedsearch">
                  Смотреть все объявления
                </Link>
              </div>
            </>
          )}
        </section>

        {/* Подписка на новости - ИСПРАВЛЕННЫЙ БЛОК */}
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
                        disabled={isSubscribing}
                        required
                      />
                      {emailError && (
                        <div className="invalid-feedback d-block">{emailError}</div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <button
                        type="submit"
                        className="btn btn-primary w-100 btn-animated"
                        disabled={isSubscribing}
                      >
                        {isSubscribing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Отправка...
                          </>
                        ) : (
                          'Подписаться'
                        )}
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
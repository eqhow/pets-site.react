import React, { useState, useContext } from 'react';
import { AuthContext, PetsContext, AlertContext } from '../../App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from "react-router-dom";

function Home() {
  const { allPets } = useContext(PetsContext);
  const { showAlert } = useContext(AlertContext);
  
  // Состояние для подписки
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // Обработчик подписки
  const handleSubscribe = (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setEmailError("Пожалуйста, введите email");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Пожалуйста, введите корректный email");
      return;
    }
    
    // Отправка подписки (здесь будет API вызов)
    showAlert("Вы успешно подписались на новости!", "success");
    setEmail("");
    setEmailError("");
  };

  // Последние 3 животные для отображения
  const recentPets = allPets.slice(0, 3);

  return (
    <div className="main-content">
      <div id="home" className="page active-page fade-in">
        {/* Слайдер с успешными историями */}
        <br />
        <section className="container mb-5">
          <h2 className="section-title">Недавно вернулись домой</h2>
          <div
            id="successStoriesCarousel"
            className="carousel slide"
            data-bs-ride="carousel"
          >
            {/* ... карусель ... */}
          </div>
        </section>
        
        {/* Карточки недавно найденных животных */}
        <section className="container mb-5">
          <h2 className="section-title">Их ждут дома</h2>
          <div className="row g-4">
            {recentPets.map(pet => (
              <div className="col-md-6 col-lg-4" key={pet.id}>
                <div className="card h-100">
                  <img
                    src={pet.image}
                    className="card-img-top pet-card-img"
                    alt={pet.kind}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{pet.kind}</h5>
                    <p className="card-text">{pet.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">Найден: {pet.date}</small>
                      <span className="badge bg-primary">{pet.kind}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                  >
                    <div className="col-md-8">
                      <input
                        type="email"
                        className={`form-control ${emailError ? 'is-invalid' : ''}`}
                        placeholder="Ваш email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
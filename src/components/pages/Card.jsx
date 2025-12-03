import React, { useContext } from 'react';
import { AuthContext, PetsContext, AlertContext } from '../../App';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Card() {
  const { id } = useParams();
  const { allPets } = useContext(PetsContext);
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  // Поиск животного по ID
  const pet = allPets.find(p => p.id === parseInt(id)) || allPets[0];
  
  // Похожие животные
  const similarPets = allPets
    .filter(p => p.id !== pet.id && p.kind === pet.kind)
    .slice(0, 3);

  // Обработчик контакта
  const handleContact = (method) => {
    if (!isLoggedIn) {
      navigate('/sign-in');
      return;
    }
    
    if (method === 'call') {
      window.location.href = `tel:${pet.phone || '+79112345678'}`;
    } else if (method === 'email') {
      window.location.href = `mailto:${pet.email || 'user@user.ru'}`;
    }
  };

  return (
    <div id="pet-card" className="page fade-in">
      <div className="container my-5">
        <div className="row">
          <div className="col-lg-8">
            {/* Фотографии животного */}
            <div
              id="petCarousel"
              className="carousel slide mb-4"
              data-bs-ride="carousel"
            >
              <div className="carousel-indicators">
                <button
                  type="button"
                  data-bs-target="#petCarousel"
                  data-bs-slide-to={0}
                  className="active"
                />
                <button
                  type="button"
                  data-bs-target="#petCarousel"
                  data-bs-slide-to={1}
                />
                <button
                  type="button"
                  data-bs-target="#petCarousel"
                  data-bs-slide-to={2}
                />
              </div>
              <div className="carousel-inner rounded-3">
                <div className="carousel-item active">
                  <img
                    src={pet.image}
                    className="d-block w-100"
                    alt={`${pet.kind} фото 1`}
                    style={{ height: 400, objectFit: "cover" }}
                  />
                </div>
                {/* Можно добавить больше изображений */}
              </div>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#petCarousel"
                data-bs-slide="prev"
              >
                <span className="carousel-control-prev-icon" />
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#petCarousel"
                data-bs-slide="next"
              >
                <span className="carousel-control-next-icon" />
              </button>
            </div>
            
            {/* Описание животного */}
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">{pet.title || `Найдена ${pet.kind}`}</h3>
                <p className="card-text">{pet.description}</p>
                
                <div className="row mt-4">
                  <div className="col-md-6">
                    <h5>Информация о животном</h5>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Вид:</span>
                        <span>{pet.kind}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Порода:</span>
                        <span>{pet.breed || 'Не указано'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Клеймо/Чип:</span>
                        <span>{pet.mark || 'Не указано'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Район:</span>
                        <span>{pet.district}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Дата находки:</span>
                        <span>{pet.date}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h5>Контактная информация</h5>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Имя:</span>
                        <span>{pet.contactName || 'Иван'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Телефон:</span>
                        <span>{pet.phone || '+79112345678'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Email:</span>
                        <span>{pet.email || 'user@user.ru'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Статус объявления:</span>
                        <span className="badge badge-moderation">
                          {pet.status === 'moderation' ? 'На модерации' : 'Активное'}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            {/* Боковая панель */}
            <div className="card mb-4">
              <div className="card-body text-center">
                <h5 className="card-title">Это ваш питомец?</h5>
                <p className="card-text">
                  Свяжитесь с нашедшим для подтверждения и получения дополнительной информации
                </p>
                <button 
                  className="btn btn-primary w-100 mb-2 btn-animated"
                  onClick={() => handleContact('call')}
                >
                  <i className="bi bi-telephone me-2" />
                  Позвонить
                </button>
                <button 
                  className="btn btn-outline-primary w-100 btn-animated"
                  onClick={() => handleContact('email')}
                >
                  <i className="bi bi-envelope me-2" />
                  Написать email
                </button>
              </div>
            </div>
            
            {/* Похожие объявления */}
            {similarPets.length > 0 && (
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Похожие объявления</h5>
                  <div className="list-group list-group-flush">
                    {similarPets.map(similarPet => (
                      <button
                        key={similarPet.id}
                        className="list-group-item list-group-item-action text-start"
                        onClick={() => navigate(`/pet/${similarPet.id}`)}
                      >
                        <div className="d-flex w-100 justify-content-between">
                          <h6 className="mb-1">Найдена {similarPet.kind}</h6>
                          <small>{similarPet.date}</small>
                        </div>
                        <p className="mb-1">Район: {similarPet.district}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
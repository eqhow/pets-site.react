import React, { useState, useContext, useEffect } from 'react';
import { AuthContext, AlertContext } from '../../App';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { api, getImageUrl } from '../../api';

function Card() {
  const { id } = useParams();
  const { isLoggedIn } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const [pet, setPet] = useState(null);
  const [similarPets, setSimilarPets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка данных животного
  useEffect(() => {
    loadPet();
  }, [id]);

  const loadPet = async () => {
    try {
      setLoading(true);
      const response = await api.getPet(id);
      console.log('Pet data:', response); // Для отладки
      
      // Обрабатываем разные форматы ответа
      let petData = null;
      
      if (response.data?.pet?.[0]) {
        petData = response.data.pet[0];
      } else if (response.data?.pet) {
        petData = response.data.pet;
      } else if (response.data?.order) {
        petData = response.data.order;
      } else {
        throw new Error('Данные животного не найдены');
      }
      
      // Обрабатываем изображения
      const processedPet = {
        ...petData,
        image: getImageUrl(petData.image),
        photos: petData.photos?.map(photo => getImageUrl(photo)) || []
      };
      
      setPet(processedPet);
      
      // Загружаем похожих животных
      try {
        const allPetsResponse = await api.getPets();
        const allPets = allPetsResponse.data?.orders || [];
        
        const processedAllPets = allPets.map(p => ({
          ...p,
          image: getImageUrl(p.image),
          photos: p.photos?.map(photo => getImageUrl(photo)) || []
        }));
        
        const similar = processedAllPets
          .filter(p => p.id !== petData.id && p.kind === petData.kind)
          .slice(0, 3);
        
        setSimilarPets(similar);
      } catch (error) {
        console.error('Ошибка загрузки похожих животных:', error);
      }
    } catch (error) {
      console.error('Ошибка загрузки животного:', error);
      showAlert('Животное не найдено или произошла ошибка', 'danger');
      setTimeout(() => navigate('/'), 2000);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик контакта
  const handleContact = (method) => {
    if (!isLoggedIn) {
      navigate('/sign-in');
      return;
    }
    
    if (!pet) return;
    
    if (method === 'call') {
      window.location.href = `tel:${pet.phone || '+79112345678'}`;
    } else if (method === 'email') {
      window.location.href = `mailto:${pet.email || 'user@user.ru'}`;
    }
  };

  if (loading) {
    return (
      <div className="page fade-in">
        <div className="container my-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="page fade-in">
        <div className="container my-5">
          <div className="text-center">
            <h3>Животное не найдено</h3>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  const photos = pet.photos && pet.photos.length > 0 
    ? pet.photos 
    : pet.image 
      ? [pet.image] 
      : ['https://via.placeholder.com/600x400?text=Нет+фото'];

  return (
    <div id="pet-card" className="page fade-in">
      <div className="container my-5">
        <div className="row">
          <div className="col-lg-8">
            {/* Фотографии животного */}
            {photos.length > 0 && (
              <div
                id="petCarousel"
                className="carousel slide mb-4"
                data-bs-ride="carousel"
              >
                <div className="carousel-indicators">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      data-bs-target="#petCarousel"
                      data-bs-slide-to={index}
                      className={index === 0 ? "active" : ""}
                    />
                  ))}
                </div>
                <div className="carousel-inner rounded-3">
                  {photos.map((photo, index) => (
                    <div key={index} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                      <img
                        src={photo}
                        className="d-block w-100"
                        alt={`${pet.kind} фото ${index + 1}`}
                        style={{ height: 400, objectFit: "cover" }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/600x400?text=Нет+фото';
                        }}
                      />
                    </div>
                  ))}
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
            )}
            
            {/* Описание животного */}
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">{pet.kind}</h3>
                <p className="card-text">{pet.description || 'Описание отсутствует'}</p>
                
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
                        <span>{pet.district || 'Не указано'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Дата находки:</span>
                        <span>{pet.date || 'Не указано'}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h5>Контактная информация</h5>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Имя:</span>
                        <span>{pet.name || 'Не указано'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Телефон:</span>
                        <span>{pet.phone || 'Не указано'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Email:</span>
                        <span>{pet.email || 'Не указано'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Статус объявления:</span>
                        <span className={`badge ${pet.status === 'onModeration' ? 'bg-warning' : 
                           pet.status === 'active' ? 'bg-success' : 
                           pet.status === 'wasFound' ? 'bg-info' : 
                           pet.status === 'archive' ? 'bg-secondary' : 'bg-dark'}`}>
                          {pet.status === 'onModeration' ? 'На модерации' : 
                           pet.status === 'active' ? 'Активное' : 
                           pet.status === 'wasFound' ? 'Хозяин найден' : 
                           pet.status === 'archive' ? 'В архиве' : pet.status || 'Неизвестно'}
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
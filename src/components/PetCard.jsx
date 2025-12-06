// components/PetCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../api';

function PetCard({ pet, noBorder = false, animatedButton = false }) {
  // Валидация данных питомца
  if (!pet || !pet.id) {
    console.error('PetCard: Отсутствуют данные питомца или id');
    return null;
  }

  // Получаем URL изображения - ТОЛЬКО ИЗ pet.photo и pet.photos
  const getPetImageUrl = () => {
    // Сначала проверяем поле photo (основное фото)
    if (pet.photo && typeof pet.photo === 'string' && pet.photo.trim() !== '') {
      const url = getImageUrl(pet.photo);
      console.log('PetCard photo URL:', url); // Для отладки
      return url;
    }
    
    // Проверяем массив photos (дополнительные фото)
    if (pet.photos && Array.isArray(pet.photos) && pet.photos.length > 0) {
      // Ищем первое непустое фото в массиве
      for (let photo of pet.photos) {
        if (photo && typeof photo === 'string' && photo.trim() !== '') {
          const url = getImageUrl(photo);
          console.log('PetCard photos URL:', url); // Для отладки
          return url;
        }
      }
    }
    
    console.log('PetCard: нет изображений, используем заглушку');
    return 'https://via.placeholder.com/300x200?text=Нет+фото';
  };

  const imageUrl = getPetImageUrl();

  // Форматируем данные для отображения
  const formatPetData = () => {
    return {
      id: pet.id,
      kind: pet.kind || pet.type || 'Животное',
      description: pet.description || 
                  pet.short_description || 
                  'Описание отсутствует',
      date: formatDate(pet.date || pet.created_at || ''),
      district: pet.district || 'Район не указан'
    };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Дата не указана';
    
    // Если дата в формате timestamp
    if (typeof dateStr === 'number') {
      const date = new Date(dateStr * 1000);
      return date.toLocaleDateString('ru-RU');
    }
    
    // Если дата в формате строки ДД-ММ-ГГГГ
    if (dateStr.includes('-')) {
      return dateStr.split('-').join('.');
    }
    
    // Если дата в формате YYYY-MM-DD
    if (dateStr.includes('-') && dateStr.length === 10) {
      const [year, month, day] = dateStr.split('-');
      return `${day}.${month}.${year}`;
    }
    
    return dateStr;
  };

  const petData = formatPetData();

  return (
    <div className="col-md-6 col-lg-4">
      <div className="card h-100">
        <img
          src={imageUrl}
          className="card-img-top pet-card-img"
          alt={petData.kind}
          style={{ height: "200px", objectFit: "cover" }}
          onError={(e) => {
            console.log('Ошибка загрузки изображения:', imageUrl);
            e.target.src = 'https://via.placeholder.com/300x200?text=Нет+фото';
          }}
          onLoad={() => {
            console.log('Изображение загружено:', imageUrl);
          }}
        />
        <div className="card-body">
          <h5 className="card-title">{petData.kind}</h5>
          <p className="card-text">{petData.description}</p>
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Найден: {petData.date}
            </small>
            <span className="badge bg-primary">{petData.district}</span>
          </div>
        </div>
        <div className={`card-footer bg-transparent ${noBorder ? 'border-0' : ''}`}>
          <Link 
            to={`/pet/${pet.id}`}
            className={`btn btn-outline-primary btn-sm w-100 ${animatedButton ? 'btn-animated' : ''}`}
            state={{ pet }}
          >
            Подробнее
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PetCard;
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

  // Получаем URL изображения - с обработкой всех возможных форматов
  const getPetImageUrl = () => {
    console.log('PetCard данные для обработки:', {
      id: pet.id,
      photo: pet.photo,
      photos: pet.photos,
      type: pet.type || pet.kind
    });

    // 1. Сначала проверяем поле photo (основное фото)
    if (pet.photo) {
      // Если photo уже полный URL
      if (typeof pet.photo === 'string' && pet.photo.trim() !== '') {
        if (pet.photo.startsWith('http')) {
          console.log('PetCard: Используем photo как полный URL');
          return pet.photo;
        }
        // Если photo не полный URL, преобразуем через getImageUrl
        const url = getImageUrl(pet.photo);
        console.log('PetCard: Преобразовали photo через getImageUrl:', url);
        return url;
      }
      // Если photo - объект с полями (например, из бэкенда)
      else if (typeof pet.photo === 'object' && pet.photo !== null) {
        // Проверяем разные возможные форматы объекта
        if (pet.photo.url && typeof pet.photo.url === 'string') {
          const url = getImageUrl(pet.photo.url);
          console.log('PetCard: Используем photo.url:', url);
          return url;
        } else if (pet.photo.path && typeof pet.photo.path === 'string') {
          const url = getImageUrl(pet.photo.path);
          console.log('PetCard: Используем photo.path:', url);
          return url;
        } else if (pet.photo.filename && typeof pet.photo.filename === 'string') {
          const url = getImageUrl(pet.photo.filename);
          console.log('PetCard: Используем photo.filename:', url);
          return url;
        }
      }
    }
    
    // 2. Проверяем массив photos (дополнительные фото)
    if (pet.photos) {
      console.log('PetCard photos тип:', typeof pet.photos, 'значение:', pet.photos);
      
      // Если photos - это строка (возможно JSON строка)
      if (typeof pet.photos === 'string') {
        try {
          // Пробуем распарсить как JSON
          const parsed = JSON.parse(pet.photos);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Ищем первую валидную фотографию в массиве
            for (let photo of parsed) {
              if (typeof photo === 'string' && photo.trim() !== '') {
                const url = getImageUrl(photo);
                console.log('PetCard: Используем photos[строка->массив]:', url);
                return url;
              } else if (typeof photo === 'object' && photo !== null) {
                // Если фото объект, ищем URL в нем
                const photoValue = photo.url || photo.path || photo.filename || photo;
                if (typeof photoValue === 'string' && photoValue.trim() !== '') {
                  const url = getImageUrl(photoValue);
                  console.log('PetCard: Используем photos[объект]:', url);
                  return url;
                }
              }
            }
          }
        } catch (e) {
          // Если не JSON, проверяем как обычную строку
          if (pet.photos.trim() !== '') {
            const url = getImageUrl(pet.photos);
            console.log('PetCard: Используем photos как строку:', url);
            return url;
          }
        }
      }
      
      // Если photos - массив
      else if (Array.isArray(pet.photos)) {
        // Ищем первую валидную фотографию в массиве
        for (let photo of pet.photos) {
          if (typeof photo === 'string' && photo.trim() !== '') {
            const url = getImageUrl(photo);
            console.log('PetCard: Используем photos[массив-строка]:', url);
            return url;
          } else if (typeof photo === 'object' && photo !== null) {
            // Если фото объект, ищем URL в нем
            const photoValue = photo.url || photo.path || photo.filename || photo;
            if (typeof photoValue === 'string' && photoValue.trim() !== '') {
              const url = getImageUrl(photoValue);
              console.log('PetCard: Используем photos[массив-объект]:', url);
              return url;
            }
          }
        }
      }
      
      // Если photos - объект (но не массив)
      else if (typeof pet.photos === 'object' && pet.photos !== null) {
        // Ищем URL в объекте
        const photoValue = pet.photos.url || pet.photos.path || pet.photos.filename;
        if (typeof photoValue === 'string' && photoValue.trim() !== '') {
          const url = getImageUrl(photoValue);
          console.log('PetCard: Используем photos[объект]:', url);
          return url;
        }
      }
    }
    
    // 3. Проверяем другие возможные поля
    const possibleImageFields = ['image', 'img', 'picture', 'avatar', 'thumbnail'];
    for (let field of possibleImageFields) {
      if (pet[field] && typeof pet[field] === 'string' && pet[field].trim() !== '') {
        const url = getImageUrl(pet[field]);
        console.log(`PetCard: Используем поле ${field}:`, url);
        return url;
      }
    }
    
    console.log('PetCard: нет изображений для питомца', pet.id, 'используем заглушку');
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
                  (typeof pet.desc === 'string' ? pet.desc : 'Описание отсутствует'),
      date: formatDate(pet.date || pet.created_at || pet.found_date || ''),
      district: pet.district || pet.area || 'Район не указан'
    };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Дата не указана';
    
    try {
      // Если дата в формате timestamp (число)
      if (typeof dateStr === 'number') {
        const date = new Date(dateStr * 1000);
        return date.toLocaleDateString('ru-RU');
      }
      
      // Если дата в формате строки
      if (typeof dateStr === 'string') {
        // Пробуем создать Date объект
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('ru-RU');
        }
        
        // Если не удалось, пробуем другие форматы
        if (dateStr.includes('-')) {
          // Формат ДД-ММ-ГГГГ
          if (dateStr.split('-').length === 3) {
            return dateStr.split('-').join('.');
          }
          // Формат YYYY-MM-DD
          else if (dateStr.length === 10) {
            const [year, month, day] = dateStr.split('-');
            return `${day}.${month}.${year}`;
          }
        }
        
        return dateStr;
      }
    } catch (e) {
      console.error('Ошибка форматирования даты:', dateStr, e);
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
            console.log('Ошибка загрузки изображения для питомца', pet.id, 'URL:', imageUrl);
            e.target.src = 'https://via.placeholder.com/300x200?text=Нет+фото';
          }}
          onLoad={() => {
            console.log('Изображение загружено для питомца', pet.id, 'URL:', imageUrl);
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
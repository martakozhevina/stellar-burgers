import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { AppHeaderUI } from '@ui';
import { useSelector } from '../../services/store';

export const AppHeader: FC = () => {
  const user = useSelector((state) => state.user.user);
  const userName = user ? user.name : '';

  return (
    <div style={{ position: 'relative' }}>
      {/* Рендерим оригинальный интерфейс шапки */}
      <AppHeaderUI userName={userName} />

      {/* Накладываем невидимые интерактивные ссылки поверх элементов шапки */}
      <nav
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 40px',
          pointerEvents: 'none' // Пропускаем клики сквозь контейнер
        }}
      >
        <div style={{ display: 'flex', gap: '20px', pointerEvents: 'auto' }}>
          {/* Ссылка поверх кнопки "Конструктор" */}
          <NavLink
            to='/'
            style={{
              width: '140px',
              height: '56px',
              display: 'block',
              cursor: 'pointer'
            }}
            title='Конструктор'
          />
          {/* Ссылка поверх кнопки "Лента заказов" */}
          <NavLink
            to='/feed'
            style={{
              width: '160px',
              height: '56px',
              display: 'block',
              cursor: 'pointer'
            }}
            title='Лента заказов'
          />
        </div>
        {/* Ссылка поверх кнопки "Личный кабинет" */}
        <NavLink
          to='/profile'
          style={{
            width: '180px',
            height: '56px',
            display: 'block',
            cursor: 'pointer',
            pointerEvents: 'auto'
          }}
          title='Личный кабинет'
        />
      </nav>
    </div>
  );
};

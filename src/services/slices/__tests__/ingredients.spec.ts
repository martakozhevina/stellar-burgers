import ingredientsReducer, { fetchIngredients } from '../ingredientsSlice';
import { TIngredient } from '@utils-types';

describe('Тестирование редюсера ingredientsSlice', () => {
  // Начальное состояние для тестов
  const initialState = {
    ingredients: [],
    loading: false,
    error: null
  };

  // Моковые данные ингредиентов для проверки fulfilled
  const mockIngredients: TIngredient[] = [
    {
      _id: '60d3b41abdacab0026a733c6',
      name: 'Краторная булка N-200i',
      type: 'bun',
      proteins: 80,
      fat: 24,
      carbohydrates: 53,
      calories: 420,
      price: 1255,
      image: '',
      image_mobile: '',
      image_large: ''
    }
  ];

  // 1. Тест на неизвестный экшен и состояние undefined
  test('должен возвращать начальное состояние при передаче undefined и неизвестного экшена', () => {
    expect(ingredientsReducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  // 2. Тесты на асинхронные экшены (fetchIngredients)
  describe('Асинхронные экшены (fetchIngredients)', () => {
    test('должен обрабатывать состояние fetchIngredients.pending', () => {
      const action = { type: fetchIngredients.pending.type };
      // Запускаем тест из состояния, где была ошибка, чтобы проверить сброс error в null
      const state = ingredientsReducer({ ...initialState, error: 'Какая-то ошибка' }, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('должен обрабатывать состояние fetchIngredients.fulfilled', () => {
      const action = { type: fetchIngredients.fulfilled.type, payload: mockIngredients };
      // Запускаем тест из состояния загрузки
      const state = ingredientsReducer({ ...initialState, loading: true }, action);

      expect(state.loading).toBe(false);
      expect(state.ingredients).toEqual(mockIngredients);
    });

    test('должен обрабатывать состояние fetchIngredients.rejected', () => {
      const action = { 
        type: fetchIngredients.rejected.type, 
        error: { message: 'Ошибка сети' } 
      };
      // Запускаем тест из состояния загрузки
      const state = ingredientsReducer({ ...initialState, loading: true }, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Ошибка сети');
      expect(state.ingredients).toEqual([]); // Данные не должны перезаписываться при ошибке
    });
  });
});

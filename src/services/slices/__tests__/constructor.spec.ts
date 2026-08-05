// Мокаем глобальный crypto.randomUUID для среды Jest/Node.js
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'mocked-unique-uuid-1111'
  }
});

import constructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearOrderModal,
  resetConstructor,
  createOrder
} from '../constructorSlice';
import { TIngredient, TConstructorIngredient, TOrder } from '@utils-types';

describe('Тестирование редюсера burgerConstructorSlice', () => {
  // Начальное состояние для тестов
  const initialState = {
    bun: null,
    ingredients: [],
    orderRequest: false,
    orderModalData: null,
    error: null
  };

  // Моковые данные ингредиентов для использования в тестах
  const mockBun: TIngredient = {
    _id: '1',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 1,
    fat: 2,
    carbohydrates: 3,
    calories: 4,
    price: 100,
    image: '',
    image_mobile: '',
    image_large: ''
  };

  const mockMainIngredient: TIngredient = {
    _id: '2',
    name: 'Биокотлета',
    type: 'main',
    proteins: 10,
    fat: 20,
    carbohydrates: 30,
    calories: 40,
    price: 200,
    image: '',
    image_mobile: '',
    image_large: ''
  };

  // 1. Тест на неизвестный экшен и состояние undefined
  test('должен возвращать начальное состояние при передаче undefined и неизвестного экшена', () => {
    expect(constructorReducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  // 2. Тесты на простые (синхронные) экшены
  describe('Синхронные экшены', () => {
    test('должен добавлять булку в поле bun через addIngredient', () => {
      const action = addIngredient(mockBun);
      const state = constructorReducer(initialState, action);
      
      expect(state.bun).toEqual(expect.objectContaining({ _id: '1', type: 'bun' }));
      // Проверяем, что сгенерировался случайный UUID id в секции prepare
      expect(state.bun).toHaveProperty('id');
      expect(state.ingredients).toHaveLength(0);
    });

    test('должен добавлять начинку в массив ingredients через addIngredient', () => {
      const action = addIngredient(mockMainIngredient);
      const state = constructorReducer(initialState, action);

      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients[0]).toEqual(expect.objectContaining({ _id: '2', type: 'main' }));
      expect(state.ingredients[0]).toHaveProperty('id');
      expect(state.bun).toBeNull();
    });

    test('должен удалять ингредиент по id через removeIngredient', () => {
      const itemWithId: TConstructorIngredient = { ...mockMainIngredient, id: 'unique-id-123' };
      const stateWithIngredient = {
        ...initialState,
        ingredients: [itemWithId]
      };

      const action = removeIngredient('unique-id-123');
      const state = constructorReducer(stateWithIngredient, action);

      expect(state.ingredients).toHaveLength(0);
    });

    test('должен менять местами ингредиенты через moveIngredient', () => {
      const item1: TConstructorIngredient = { ...mockMainIngredient, _id: '2', id: 'id-1' };
      const item2: TConstructorIngredient = { ...mockMainIngredient, _id: '3', id: 'id-2' };
      
      const stateWithIngredients = {
        ...initialState,
        ingredients: [item1, item2]
      };

      // Перемещаем первый элемент (индекс 0) вниз
      const action = moveIngredient({ index: 0, direction: 'down' });
      const state = constructorReducer(stateWithIngredients, action);

      expect(state.ingredients[0].id).toBe('id-2');
      expect(state.ingredients[1].id).toBe('id-1');
    });

    test('должен очищать данные модального окна заказа через clearOrderModal', () => {
      const mockOrder: TOrder = {
        _id: 'order-id',
        status: 'done',
        name: 'Космический бургер',
        createdAt: '',
        updatedAt: '',
        number: 1234,
        ingredients: []
      };
      
      const stateWithOrder = { ...initialState, orderModalData: mockOrder };
      const action = clearOrderModal();
      const state = constructorReducer(stateWithOrder, action);

      expect(state.orderModalData).toBeNull();
    });

    test('должен полностью сбрасывать конструктор через resetConstructor', () => {
      const stateWithData = {
        ...initialState,
        bun: mockBun,
        ingredients: [{ ...mockMainIngredient, id: 'id-1' }]
      };

      const action = resetConstructor();
      const state = constructorReducer(stateWithData, action);

      expect(state.bun).toBeNull();
      expect(state.ingredients).toHaveLength(0);
    });
  });

  // 3. Тесты на асинхронные экшены (createOrder)
  describe('Асинхронные экшены (createOrder)', () => {
    test('должен обрабатывать состояние createOrder.pending', () => {
      const action = { type: createOrder.pending.type };
      const state = constructorReducer(initialState, action);

      expect(state.orderRequest).toBe(true);
      expect(state.error).toBeNull();
    });

    test('должен обрабатывать состояние createOrder.fulfilled', () => {
      const mockOrder: TOrder = {
        _id: 'order-id',
        status: 'done',
        name: 'Стеллар Бургер',
        createdAt: '',
        updatedAt: '',
        number: 7777,
        ingredients: []
      };

      const action = { type: createOrder.fulfilled.type, payload: mockOrder };
      // Запускаем из состояния orderRequest: true
      const state = constructorReducer({ ...initialState, orderRequest: true }, action);

      expect(state.orderRequest).toBe(false);
      expect(state.orderModalData).toEqual(mockOrder);
    });

    test('должен обрабатывать состояние createOrder.rejected', () => {
      const action = { 
        type: createOrder.rejected.type, 
        error: { message: 'Ошибка сервера' } 
      };
      
      const state = constructorReducer({ ...initialState, orderRequest: true }, action);

      expect(state.orderRequest).toBe(false);
      expect(state.error).toBe('Ошибка сервера');
    });
  });
});

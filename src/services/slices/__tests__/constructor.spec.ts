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
  const initialState = {
    bun: null,
    ingredients: [],
    orderRequest: false,
    orderModalData: null,
    error: null
  };

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

  test('должен возвращать начальное состояние при передаче undefined и неизвестного экшена', () => {
    expect(constructorReducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  describe('Синхронные экшены', () => {
    test('должен добавлять булку в поле bun через addIngredient', () => {
      const action = addIngredient(mockBun);
      const state = constructorReducer(initialState, action);

      expect(state.bun).toEqual(expect.objectContaining({ _id: '1', type: 'bun' }));})})})
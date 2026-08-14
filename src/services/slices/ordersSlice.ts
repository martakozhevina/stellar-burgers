import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOrdersApi, getOrderByNumberApi } from '@api';
import { TOrder } from '@utils-types';

type TOrdersState = {
  orders: TOrder[];
  orderByNumber: TOrder | null; // Поле для сохранения одиночного заказа
  loading: boolean;
};

const initialState: TOrdersState = {
  orders: [],
  orderByNumber: null,
  loading: false
};

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async () => {
    const response = await getOrdersApi();
    return response;
  }
);

// Создаем thunk и забираем первый заказ из возвращаемого массива orders
export const getOrderByNumber = createAsyncThunk(
  'orders/getOrderByNumber',
  async (number: number) => {
    const response = await getOrderByNumberApi(number);
    return response.orders[0]; // Достаем объект конкретного заказа
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchUserOrders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state) => {
        state.loading = false;
      })
      // getOrderByNumber
      .addCase(getOrderByNumber.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrderByNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.orderByNumber = action.payload; // Записываем данные в стейт
      })
      .addCase(getOrderByNumber.rejected, (state) => {
        state.loading = false;
      });
  }
});

export default ordersSlice.reducer;

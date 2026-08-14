import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFeedsApi } from '@api';
import { TOrder } from '@utils-types';

type TFeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  loading: boolean;
};

const initialState: TFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  loading: false
};

export const fetchFeedOrders = createAsyncThunk(
  'feed/fetchFeedOrders',
  async () => {
    const response = await getFeedsApi();
    return response;
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeedOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(fetchFeedOrders.rejected, (state) => {
        state.loading = false;
      });
  }
});

export default feedSlice.reducer;

import { RootState } from '../store';

export const selectIngredients = (state: RootState) =>
  state.ingredients.ingredients;
export const selectUserOrders = (state: RootState) => state.orders.orders;
export const selectFeedOrders = (state: RootState) => state.feed.orders;
export const selectOrderByNumber = (state: RootState) =>
  state.orders.orderByNumber;
export const selectUser = (state: RootState) => state.user.user;

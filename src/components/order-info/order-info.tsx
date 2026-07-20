import { FC, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from '../../services/store';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { getOrderByNumber } from '../../services/slices/ordersSlice';
import {
  selectIngredients,
  selectUserOrders,
  selectFeedOrders,
  selectOrderByNumber
} from '../../services/selectors';

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number: string }>();
  const dispatch = useDispatch();

  const ingredients = useSelector(selectIngredients);
  const userOrders = useSelector(selectUserOrders);
  const feedOrders = useSelector(selectFeedOrders);
  const orderByNumberOrder = useSelector(selectOrderByNumber);

  const orderData = useMemo(() => {
    if (!number) return null;
    const parsedNumber = parseInt(number, 10);

    return (
      userOrders.find((item) => item.number === parsedNumber) ||
      feedOrders.find((item) => item.number === parsedNumber) ||
      (orderByNumberOrder && orderByNumberOrder.number === parsedNumber
        ? orderByNumberOrder
        : null) ||
      null
    );
  }, [userOrders, feedOrders, orderByNumberOrder, number]);

  useEffect(() => {
    if (!orderData && number) {
      dispatch(getOrderByNumber(parseInt(number, 10)));
    }
  }, [dispatch, orderData, number]);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    const ingredientsInfo = orderData.ingredients.reduce((acc: any, item) => {
      if (!acc[item]) {
        const ingredient = ingredients.find((ing) => ing._id === item);
        if (ingredient) {
          acc[item] = { ...ingredient, count: 1 };
        }
      } else {
        acc[item].count++;
      }
      return acc;
    }, {});

    const total = Object.values(ingredientsInfo).reduce(
      (acc: number, item: any) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};

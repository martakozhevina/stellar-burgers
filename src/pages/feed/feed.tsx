import { FeedUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { fetchFeedOrders } from '../../services/slices/feedSlice';

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.feed.orders);

  // Изолированная функция для повторного запроса данных с сервера
  const handleGetFeeds = () => {
    dispatch(fetchFeedOrders());
  };

  useEffect(() => {
    dispatch(fetchFeedOrders());
  }, [dispatch]);

  if (!orders.length) {
    return null;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};

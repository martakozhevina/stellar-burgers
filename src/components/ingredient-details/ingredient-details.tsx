import { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from '../../services/store';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';

export const IngredientDetails: FC = () => {
  const { id } = useParams<{ id: string }>();

  // Достаем массив ингредиентов с сервера из стора Redux
  const ingredients = useSelector((state) => state.ingredients.ingredients);

  // Находим нужный ингредиент по ID из адресной строки
  const ingredientData = useMemo(() => {
    if (!id) return null;
    return ingredients.find((item) => item._id === id) || null;
  }, [ingredients, id]);

  if (!ingredientData) {
    return <Preloader />;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};

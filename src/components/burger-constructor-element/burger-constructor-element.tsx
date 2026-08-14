import { FC, memo } from 'react';
import { useDispatch } from '../../services/store';
import {
  removeIngredient,
  moveIngredient
} from '../../services/slices/constructorSlice';
import { BurgerConstructorElementUI } from '@ui';
import { BurgerConstructorElementProps } from './type';

export const BurgerConstructorElement: FC<BurgerConstructorElementProps> = memo(
  ({ ingredient, index, totalItems }) => {
    const dispatch = useDispatch();

    const handleClose = () => {
      dispatch(removeIngredient(ingredient.id));
    };

    // Вызываем экшен перемещения вверх
    const handleMoveUp = () => {
      dispatch(moveIngredient({ index, direction: 'up' }));
    };

    // Вызываем экшен перемещения вниз
    const handleMoveDown = () => {
      dispatch(moveIngredient({ index, direction: 'down' }));
    };

    return (
      <BurgerConstructorElementUI
        ingredient={ingredient}
        index={index}
        totalItems={totalItems}
        handleMoveUp={handleMoveUp}
        handleMoveDown={handleMoveDown}
        handleClose={handleClose}
      />
    );
  }
);

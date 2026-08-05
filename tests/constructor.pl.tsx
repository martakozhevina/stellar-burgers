import { test, expect } from '@playwright/test';

// 1. Моковые данные для ингредиентов
const mockIngredients = {
  success: true,
  data: [
    {
      _id: '60d3b41abdacab0026a733c6',
      name: 'Краторная булка N-200i',
      type: 'bun',
      price: 1255,
      proteins: 80, fat: 24, carbohydrates: 53, calories: 420,
      image: 'https://yandex.net',
      image_mobile: 'https://yandex.net',
      image_large: 'https://yandex.net',
      __v: 0
    },
    {
      _id: '60d3b41abdacab0026a733c8',
      name: 'Филе Люминесцентного Тетраодона',
      type: 'main',
      price: 988,
      proteins: 44, fat: 26, carbohydrates: 85, calories: 643,
      image: 'https://yandex.net',
      image_mobile: 'https://yandex.net',
      image_large: 'https://yandex.net',
      __v: 0
    }
  ]
};

// 2. Моковые данные ответа на запрос данных пользователя (Профиль)
const mockUserResponse = {
  success: true,
  user: {
    email: 'marta_test@yandex.ru',
    name: 'Марта Кожевина'
  }
};

// 3. Моковые данные ответа на запрос создания заказа
const mockOrderResponse = {
  success: true,
  name: 'Краторный люминесцентный бургер',
  order: {
    number: 48592, // Номер заказа для проверки в модальном окне
    status: 'done',
    name: 'Краторный люминесцентный бургер',
    createdAt: '2026-08-05T12:00:00.000Z',
    updatedAt: '2026-08-05T12:01:00.000Z',
    _id: '60d3b41abdacab0026a733f5',
    ingredients: ['60d3b41abdacab0026a733c6', '60d3b41abdacab0026a733c8', '60d3b41abdacab0026a733c6'],
    owner: {
      name: 'Марта',
      email: 'marta_test@yandex.ru',
      createdAt: '',
      updatedAt: ''
    },
    price: 3498
  }
};

test.describe('Тестирование конструктора бургера и модальных окон', () => {
  
  test.beforeEach(async ({ page, context }) => {
    await page.routeFromHAR('tests/hars/api.har', {
      url: '**/api/**', 
      notFound: 'fallback'
    });
    // Перехватываем запрос на эндпоинт 'api/ingredients' и возвращаем моки ингредиентов
    await page.route('**/api/ingredients', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockIngredients),
      });
    });

    // Перехватываем запрос данных пользователя (обычно /api/auth/user)
    await page.route('**/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUserResponse),
      });
    });

    // Перехватываем запрос на создание заказа (обычно /api/orders)
    await page.route('**/api/orders', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOrderResponse),
      });
    });

    // Подставляем моковые токены авторизации (куки и localStorage)
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'Bearer-mock-token-12345',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // Перед переходом на страницу инициализируем localStorage моковым рефреш-токеном
    await page.addInitScript(() => {
      window.localStorage.setItem('refreshToken', 'mock-refresh-token-67890');
    });

    // Переходим на главную страницу приложения
    await page.goto('/');
  });

  test('Должно работать добавление булок и начинок в конструктор (Drag and Drop)', async ({ page }) => {
    const bunIngredient = page.locator('text=Краторная булка N-200i').first();
    const mainIngredient = page.locator('text=Филе Люминесцентного Тетраодона').first();
    const constructorTarget = page.locator('[class^=burger-constructor]'); 

    await bunIngredient.dragTo(constructorTarget);
    await mainIngredient.dragTo(constructorTarget);

    await expect(constructorTarget.locator('text=Краторная булка N-200i (верх)')).toBeVisible();
    await expect(constructorTarget.locator('text=Филе Люминесцентного Тетраодона')).toBeVisible();
    await expect(constructorTarget.locator('text=Краторная булка N-200i (низ)')).toBeVisible();
  });

  test('Работа модальных окон: открытие, закрытие по крестику и оверлею', async ({ page }) => {
    await page.locator('text=Краторная булка N-200i').first().click();

    const modal = page.locator('[class^=modal]'); 
    await expect(modal).toBeVisible();
    await expect(modal.locator('text=Детали ингредиента')).toBeVisible();

    const closeButton = page.locator('[class^=modal_close]'); 
    await closeButton.click();
    await expect(modal).not.toBeVisible();

    await page.locator('text=Краторная булка N-200i').first().click();
    await expect(modal).toBeVisible();

    const overlay = page.locator('[class^=modal-overlay]'); 
    await overlay.click({ force: true });
    await expect(modal).not.toBeVisible();
  });

  test('Создание заказа (сборка, авторизация, отправка и очистка конструктора)', async ({ page }) => {
    const bunIngredient = page.locator('text=Краторная булка N-200i').first();
    const mainIngredient = page.locator('text=Филе Люминесцентного Тетраодона').first();
    const constructorTarget = page.locator('[class^=burger-constructor]'); 

    // 1. Собирается бургер (Drag and Drop)
    await bunIngredient.dragTo(constructorTarget);
    await mainIngredient.dragTo(constructorTarget);

    // 2. Вызывается клик по кнопке «Оформить заказ»
    // Ищем кнопку по тексту. Замени селектор, если у тебя кнопка называется иначе
    const orderButton = page.locator('button:has-text("Оформить заказ")');
    await orderButton.click();

    // 3. Проверяется, что модальное окно открылось и номер заказа верный (48592)
    const modal = page.locator('[class^=modal]');
    await expect(modal).toBeVisible();
    await expect(modal.locator('text=48592')).toBeVisible();

    // 4. Закрывается модальное окно кликом на крестик
    const closeButton = page.locator('[class^=modal_close]');
    await closeButton.click();
    
    // 5. Проверяется успешность закрытия модального окна
    await expect(modal).not.toBeVisible();

    // 6. Проверяется, что конструктор пуст (ингредиенты пропали из списка конструктора)
    await expect(constructorTarget.locator('text=Краторная булка N-200i (верх)')).not.toBeVisible();
    await expect(constructorTarget.locator('text=Филе Люминесцентного Тетраодона')).not.toBeVisible();
  });
});

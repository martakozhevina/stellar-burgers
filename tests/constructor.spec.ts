import { test, expect } from '@playwright/test';

test.describe('Тестирование конструктора бургера и модальных окон с HAR-моками', () => {
  test.beforeEach(async ({ page, context }) => {
    // Все запросы к бэкенду (/api/**) обслуживаются исключительно из HAR-файла:
    // update не указан (по умолчанию false) — файл не перезаписывается «живым» трафиком,
    // notFound: 'abort' — любой запрос, для которого нет записи в HAR, считается ошибкой
    // теста, а не тихо уходит в реальную сеть.
    await page.routeFromHAR('tests/hars/api.har', {
      url: '**/api/**',
      notFound: 'abort'
    });

    // Подставляем фейковые токены авторизации
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'Bearer-mock-token-playwright-12345',
        domain: 'localhost',
        path: '/'
      }
    ]);

    // Записываем токен обновления в localStorage до инициализации страницы
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'refreshToken',
        'mock-refresh-token-playwright-67890'
      );
    });

    // Переходим на главную страницу приложения
    await page.goto('/');
  });

  test('Добавление ингредиентов из списка в конструктор кликом (не drag-and-drop)', async ({
    page
  }) => {
    // В приложении ингредиент добавляется кликом по кнопке «Добавить»
    // (см. handleAdd в burger-ingredient.tsx) — drag-and-drop в проекте не реализован,
    // поэтому и в тесте используется click, а не dragTo.
    const bunCard = page.locator('li', { hasText: 'Краторная булка N-200i' }).first();
    const mainCard = page
      .locator('li', { hasText: 'Филе Люминесцентного Тетраодона' })
      .first();

    await bunCard.locator('button').first().click();
    await mainCard.locator('button').first().click();

    // На странице два <section> — сначала список ингредиентов (BurgerIngredients),
    // затем сам конструктор (BurgerConstructor), поэтому берём последний,
    // а не первый попавшийся <section>.
    const constructorTarget = page.locator('section').last();
    await expect(
      constructorTarget.locator('text=Краторная булка N-200i (верх)')
    ).toBeVisible();
    await expect(
      constructorTarget.locator('text=Филе Люминесцентного Тетраодона')
    ).toBeVisible();
    await expect(
      constructorTarget.locator('text=Краторная булка N-200i (низ)')
    ).toBeVisible();
  });

  test('Открытие и закрытие модального окна с деталями именно выбранного ингредиента', async ({
    page
  }) => {
    const bunCard = page.locator('li', { hasText: 'Краторная булка N-200i' }).first();
    const mainCard = page
      .locator('li', { hasText: 'Филе Люминесцентного Тетраодона' })
      .first();

    // --- Открываем модалку булки и проверяем, что в ней данные именно булки ---
    await bunCard.locator('a').first().click();

    // Модалка рендерится порталом в #modals (см. modal.tsx). Внутри портала лежат
    // два элемента верхнего уровня — сама модалка и оверлей. Их div-обёртки оба
    // подходят под селектор "начинается с modal" в скомпилированных CSS-модулях
    // (modal_modal__xxx и modal-overlay_overlay__xxx), поэтому вместо
    // '[class^=modal]' используем структурный путь через портал и .first(),
    // который в DOM-порядке всегда указывает на саму модалку, а не на оверлей.
    const modal = page.locator('#modals div').first();
    await expect(modal).toBeVisible();
    await expect(modal.locator('text=Детали ингредиента')).toBeVisible();

    // Подтверждаем, что показаны данные именно кликнутого ингредиента (булки),
    // а не какого-то другого — название и все БЖУ/калории из карточки булки.
    await expect(modal.locator('h3', { hasText: 'Краторная булка N-200i' })).toBeVisible();
    await expect(
      modal.locator('li', { hasText: 'Калории, ккал' }).locator('text=420')
    ).toBeVisible();
    await expect(
      modal.locator('li', { hasText: 'Белки, г' }).locator('text=80')
    ).toBeVisible();
    await expect(
      modal.locator('li', { hasText: 'Жиры, г' }).locator('text=24')
    ).toBeVisible();
    await expect(
      modal.locator('li', { hasText: 'Углеводы, г' }).locator('text=53')
    ).toBeVisible();

    // Закрытие по кнопке-крестику
    const closeButton = modal.locator('button').first();
    await closeButton.click();
    await expect(modal).not.toBeVisible();

    // --- Открываем модалку начинки и проверяем, что данные сменились на её данные ---
    await mainCard.locator('a').first().click();
    await expect(modal).toBeVisible();
    await expect(
      modal.locator('h3', { hasText: 'Филе Люминесцентного Тетраодона' })
    ).toBeVisible();
    await expect(
      modal.locator('li', { hasText: 'Калории, ккал' }).locator('text=643')
    ).toBeVisible();
    await expect(
      modal.locator('li', { hasText: 'Белки, г' }).locator('text=44')
    ).toBeVisible();

    // Закрытие по клику на оверлей (кликаем в угол экрана мимо модалки)
    await page.mouse.click(5, 5);
    await expect(modal).not.toBeVisible();
  });

  test('Процесс создания заказа: сборка, отправка, проверка номера и очистка конструктора', async ({
    page
  }) => {
    const bunCard = page.locator('li', { hasText: 'Краторная булка N-200i' }).first();
    const mainCard = page
      .locator('li', { hasText: 'Филе Люминесцентного Тетраодона' })
      .first();

    // Собираем бургер кликами по кнопкам «Добавить»
    await bunCard.locator('button').first().click();
    await mainCard.locator('button').first().click();

    // На странице два <section> — сначала список ингредиентов, затем конструктор.
    const constructorTarget = page.locator('section').last();

    // Нажимаем «Оформить заказ»
    const orderButton = constructorTarget.locator('button:has-text("Оформить заказ")');
    await orderButton.click();

    // Ответ из api.har приходит мгновенно (это мок), поэтому статус «Оформляем
    // заказ...» может успеть промелькнуть и исчезнуть ещё до первого опроса
    // условия — жёсткая проверка на этот промежуточный текст делает тест
    // флаки. Вместо этого сразу дожидаемся модалки с результатом заказа —
    // именно она подтверждает, что запрос дошёл и обработался.
    const modal = page.locator('#modals div').first();
    await expect(modal.locator('text=идентификатор заказа')).toBeVisible({
      timeout: 15000
    });

    // Проверяем, что отображается номер заказа, пришедший из мока в api.har
    const orderNumber = modal.locator('h2');
    await expect(orderNumber).toHaveText('48592');

    // Закрываем окно заказа
    const closeButton = modal.locator('button').first();
    await closeButton.click();
    await expect(modal).not.toBeVisible();

    // Конструктор должен быть полностью очищен (заглушки "Выберите булки" /
    // "Выберите начинку" должны вернуться на экран)
    await expect(constructorTarget.locator('text=Выберите булки').first()).toBeVisible();
    await expect(constructorTarget.locator('text=Выберите начинку')).toBeVisible();
  });
});

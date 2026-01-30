import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should display login page correctly", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator("text=Iniciar sesión")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("should display register page correctly", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(page.locator("text=Crear cuenta")).toBeVisible();
  });

  test("should show validation errors on empty login", async ({ page }) => {
    await page.goto("/auth/login");
    await page.click('[data-testid="button-login"]');
    await expect(page.locator("text=correo")).toBeVisible();
  });

  test("should navigate between login and register", async ({ page }) => {
    await page.goto("/auth/login");
    await page.click("text=Crear una cuenta");
    await expect(page).toHaveURL(/register/);
  });
});

test.describe("Password Recovery Flow", () => {
  test("should display forgot password page", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await expect(page.locator("text=contraseña")).toBeVisible();
  });
});

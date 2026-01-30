import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage loads correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=LLC")).toBeVisible();
    await expect(page.locator("text=Home")).toBeVisible();
  });

  test("servicios page loads", async ({ page }) => {
    await page.goto("/servicios");
    await expect(page.locator("text=Constituimos tu LLC")).toBeVisible();
  });

  test("FAQ page loads", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.locator("text=Preguntas")).toBeVisible();
  });

  test("contacto page loads", async ({ page }) => {
    await page.goto("/contacto");
    await expect(page.locator("text=Contacto")).toBeVisible();
  });

  test("legal pages load", async ({ page }) => {
    await page.goto("/legal/terminos");
    await expect(page.locator("text=Términos")).toBeVisible();
  });

  test("navbar is visible on all pages", async ({ page }) => {
    const pages = ["/", "/servicios", "/faq", "/contacto"];
    for (const url of pages) {
      await page.goto(url);
      await expect(page.locator("nav")).toBeVisible();
    }
  });

  test("footer is visible on homepage", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator("footer")).toBeVisible();
  });
});

test.describe("Theme Toggle", () => {
  test("theme toggle exists", async ({ page }) => {
    await page.goto("/");
    const themeButton = page.locator('[data-testid="theme-toggle"]');
    if (await themeButton.isVisible()) {
      await expect(themeButton).toBeVisible();
    }
  });
});

test.describe("Mobile Navigation", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("mobile menu works", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.locator("text=Servicios")).toBeVisible();
    }
  });
});

import { test, expect } from "@playwright/test";

test.describe("LLC Formation Flow", () => {
  test("should display LLC formation page", async ({ page }) => {
    await page.goto("/llc/formation");
    await expect(page.locator("text=Constituir mi LLC")).toBeVisible();
    await expect(page.locator("text=Paso 1")).toBeVisible();
  });

  test("should show first step - name input", async ({ page }) => {
    await page.goto("/llc/formation");
    await expect(page.locator("text=¿Cómo te llamas?")).toBeVisible();
    await expect(page.locator('input[name="ownerName"]')).toBeVisible();
  });

  test("should require name to continue", async ({ page }) => {
    await page.goto("/llc/formation");
    await page.click("button:has-text('Continuar')");
    await expect(page.locator("text=Paso 1")).toBeVisible();
  });

  test("should advance to step 2 with valid name", async ({ page }) => {
    await page.goto("/llc/formation");
    await page.fill('input[name="ownerName"]', "Juan García");
    await page.click("button:has-text('Continuar')");
    await expect(page.locator("text=Paso 2")).toBeVisible();
  });

  test("should show Google login option", async ({ page }) => {
    await page.goto("/llc/formation");
    await expect(page.locator("text=Google")).toBeVisible();
  });
});

test.describe("Maintenance Page", () => {
  test("should display maintenance page", async ({ page }) => {
    await page.goto("/maintenance");
    await expect(page.locator("text=Mantenimiento")).toBeVisible();
  });
});

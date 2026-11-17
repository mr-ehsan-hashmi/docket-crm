import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // short window so the list is taller than the screen
  await page.setViewportSize({ width: 1280, height: 520 });
  await page.goto("/contacts");
  await expect(page.getByRole("link", { name: /Amara Osei/ })).toBeVisible();
});

const scrollTop = (page: import("@playwright/test").Page) =>
  page.locator(".scroll-area").evaluate((element) => element.scrollTop);

test("the header stays in place while the content scrolls", async ({ page }) => {
  await page.getByRole("link", { name: /Sofia Bianchi/ }).scrollIntoViewIfNeeded();
  expect(await scrollTop(page)).toBeGreaterThan(0);

  const header = await page.getByRole("banner").boundingBox();
  expect(header?.y).toBe(0);

  // the scrollbar belongs to the content, so it starts below the header
  const content = await page.locator(".scroll-area").boundingBox();
  expect(content?.y).toBeCloseTo(header?.height ?? 0, 0);
});

test("a new page starts at the top", async ({ page }) => {
  await page.getByRole("link", { name: /Sofia Bianchi/ }).scrollIntoViewIfNeeded();
  await page.getByRole("link", { name: /Sofia Bianchi/ }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Sofia Bianchi" })).toBeVisible();
  expect(await scrollTop(page)).toBe(0);
});

test("nothing shifts sideways when a search makes the list short", async ({ page }) => {
  const heading = page.getByRole("heading", { level: 1, name: "Contacts" });
  const before = await heading.boundingBox();

  await page.getByRole("searchbox", { name: "Search contacts" }).fill("amara");
  await expect(page.getByRole("main").getByRole("listitem")).toHaveCount(1);

  const after = await heading.boundingBox();
  expect(after?.x).toBe(before?.x);

  const logo = await page.getByRole("banner").getByRole("link", { name: /Docket/ }).boundingBox();
  expect(logo?.x).toBeCloseTo(after?.x ?? -1, 0);
});

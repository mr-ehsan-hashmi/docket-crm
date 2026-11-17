import { expect, test, type Page } from "@playwright/test";

async function expectNoSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
}

test("no screen scrolls sideways on a phone", async ({ page }) => {
  await page.goto("/contacts");
  await expect(page.getByRole("link", { name: /Amara Osei/ })).toBeVisible();
  await expectNoSidewaysScroll(page);

  await page.getByRole("link", { name: /Amara Osei/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Amara Osei" })).toBeVisible();
  await expectNoSidewaysScroll(page);

  await page.goto("/pipeline");
  await expect(page.getByRole("link", { name: "Amara Osei" })).toBeVisible();
  await expectNoSidewaysScroll(page);

  await page.goto("/contacts/new");
  await expect(page.getByLabel("Full name")).toBeVisible();
  await expectNoSidewaysScroll(page);
});

test("a very long word wraps instead of stretching the page", async ({ page }) => {
  const longName = "Wolfeschlegelsteinhausenbergerdorffwelchevoralternwarengewissenhaftschaferswesse";

  await page.goto("/contacts/new");
  await page.getByLabel("Full name").fill(longName);
  await page.getByLabel("Email").fill("someone.with.a.long.address@intake-department.example-lawfirm.co.uk");
  await page.getByLabel("Practice area").selectOption("corporate");
  await page.getByLabel("Matter summary").fill("x".repeat(200));
  await page.getByRole("button", { name: "Add contact" }).click();

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Wolfeschlegel");
  await expectNoSidewaysScroll(page);

  await page.goto("/pipeline");
  const card = page.getByRole("listitem").filter({ hasText: "Wolfeschlegel" });
  await expect(card).toBeVisible();
  const spill = await card.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(spill).toBe(0);
});

test("status can be changed on a phone, with a finger-sized control", async ({ page }) => {
  await page.goto("/pipeline");
  const menu = page.getByLabel("Move to another status, Amara Osei");
  await expect(menu).toBeVisible();

  const box = await menu.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);

  await menu.selectOption("active");
  await expect(page.getByText("Amara Osei moved to Active.")).toBeVisible();
  await expect(page.getByRole("region", { name: /^Active, 5/ })).toBeVisible();
});

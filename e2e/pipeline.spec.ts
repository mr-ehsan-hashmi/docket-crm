import { expect, test, type Page } from "@playwright/test";

const column = (page: Page, status: "Lead" | "Active" | "Closed") =>
  page.getByRole("region", { name: new RegExp(`^${status},`) });

const moveMenu = (page: Page, name: string) => page.getByLabel(`Move to another status, ${name}`);

test.beforeEach(async ({ page }) => {
  await page.goto("/pipeline");
  await expect(column(page, "Lead").getByRole("link", { name: "Amara Osei" })).toBeVisible();
});

test("has one column per status", async ({ page }) => {
  await expect(column(page, "Lead").getByRole("listitem")).toHaveCount(4);
  await expect(column(page, "Active").getByRole("listitem")).toHaveCount(4);
  await expect(column(page, "Closed").getByRole("listitem")).toHaveCount(3);
});

test("moves a card with the menu, undoes it, and remembers the final column", async ({ page }) => {
  await moveMenu(page, "Amara Osei").selectOption("active");
  await expect(column(page, "Active").getByRole("link", { name: "Amara Osei" })).toBeVisible();
  await expect(page.getByText("Amara Osei moved to Active.")).toBeVisible();

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(column(page, "Lead").getByRole("link", { name: "Amara Osei" })).toBeVisible();
  await expect(page.getByText("Amara Osei moved back to Lead.")).toBeVisible();

  await moveMenu(page, "Amara Osei").selectOption("closed");
  await expect(column(page, "Closed").getByRole("link", { name: "Amara Osei" })).toBeVisible();

  await page.reload();
  await expect(column(page, "Closed").getByRole("link", { name: "Amara Osei" })).toBeVisible();
  await expect(column(page, "Lead").getByRole("listitem")).toHaveCount(3);
});

test("moves a card by dragging it", async ({ page }) => {
  const card = column(page, "Lead").getByRole("listitem").filter({ hasText: "Tomás Villareal" });
  const from = await card.boundingBox();
  const to = await column(page, "Active").boundingBox();
  if (!from || !to) throw new Error("board is not laid out");

  await page.mouse.move(from.x + from.width / 2, from.y + 12);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + 80, { steps: 12 });
  await page.mouse.up();

  await expect(column(page, "Active").getByRole("link", { name: "Tomás Villareal" })).toBeVisible();
  await expect(page.getByText("Tomás Villareal moved to Active.")).toBeVisible();
});

test("puts the card back and says so when the save fails", async ({ page }) => {
  await page.evaluate(() => localStorage.setItem("docket:simulate-failure", "on"));

  await moveMenu(page, "Amara Osei").selectOption("active");

  await expect(page.getByText("Couldn't move Amara Osei, so they're still in Lead.")).toBeVisible();
  await expect(column(page, "Lead").getByRole("link", { name: "Amara Osei" })).toBeVisible();
  await expect(column(page, "Active").getByRole("listitem")).toHaveCount(4);
});

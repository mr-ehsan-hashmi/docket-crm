import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/contacts");
  await expect(page.getByRole("link", { name: /Amara Osei/ })).toBeVisible();
});

const rows = (page: import("@playwright/test").Page) => page.getByRole("main").getByRole("listitem");

test("shows the sample contacts", async ({ page }) => {
  await expect(rows(page)).toHaveCount(11);
  await expect(page.getByText("11 people on file.")).toBeVisible();
});

test("search and status filter narrow the list and survive a reload", async ({ page }) => {
  await page.getByRole("searchbox", { name: "Search contacts" }).fill("qureshi");
  await expect(rows(page)).toHaveCount(2);
  await expect(page).toHaveURL(/q=qureshi/);

  await page.getByRole("button", { name: /^Closed/ }).click();
  await expect(page.getByRole("heading", { name: "No contacts match" })).toBeVisible();

  await page.getByRole("button", { name: /^Active/ }).click();
  await expect(rows(page)).toHaveCount(2);
  await expect(page).toHaveURL(/status=active/);

  await page.reload();
  await expect(page.getByRole("searchbox", { name: "Search contacts" })).toHaveValue("qureshi");
  await expect(page.getByRole("button", { name: /^Active/ })).toHaveAttribute("aria-pressed", "true");
  await expect(rows(page)).toHaveCount(2);
});

test("finds a contact by phone number however it is typed", async ({ page }) => {
  await page.getByRole("searchbox", { name: "Search contacts" }).fill("415 555 0132");
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toContainText("Amara Osei");
});

test("sorts by name", async ({ page }) => {
  await page.getByLabel("Sort by").selectOption("name");
  await expect(rows(page).first()).toContainText("Amara Osei");
  await expect(rows(page).last()).toContainText("Tomás Villareal");
  await expect(page).toHaveURL(/sort=name/);
});

test("clearing a search that matches nothing brings everyone back", async ({ page }) => {
  await page.getByRole("searchbox", { name: "Search contacts" }).fill("zzzz");
  await expect(page.getByRole("heading", { name: "No contacts match" })).toBeVisible();

  await page.getByRole("button", { name: "Clear search and filters" }).click();
  await expect(rows(page)).toHaveCount(11);
  await expect(page.getByRole("searchbox", { name: "Search contacts" })).toHaveValue("");
});

test("follow-up filter shows only leads that have gone quiet", async ({ page }) => {
  await page.getByRole("button", { name: /Needs follow-up/ }).click();

  await expect(rows(page)).toHaveCount(2);
  await expect(rows(page).filter({ hasText: "Priya Raghunathan" })).toContainText("Quiet for 4 days");
  await expect(rows(page).filter({ hasText: "Henrik Lindqvist" })).toContainText("Quiet for 6 days");
  await expect(page).toHaveURL(/followup=1/);
});

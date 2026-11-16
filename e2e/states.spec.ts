import { expect, test } from "@playwright/test";

test("shows an error with a way to retry, and recovers", async ({ page }) => {
  await page.goto("/contacts");
  await expect(page.getByRole("link", { name: /Amara Osei/ })).toBeVisible();

  await page.getByText("Reviewer tools").click();
  await page.getByLabel("Make every request fail").check();
  await expect(page.getByRole("heading", { name: "We couldn't load your contacts" })).toBeVisible();

  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("heading", { name: "We couldn't load your contacts" })).toBeVisible();

  await page.getByLabel("Make every request fail").uncheck();
  await expect(page.getByRole("link", { name: /Amara Osei/ })).toBeVisible();
});

test("a failed save keeps what was typed", async ({ page }) => {
  await page.goto("/contacts/new");
  await page.getByLabel("Full name").fill("Nadia Rahman");
  await page.getByLabel("Email").fill("nadia@example.com");
  await page.getByLabel("Practice area").selectOption("property");

  await page.evaluate(() => localStorage.setItem("docket:simulate-failure", "on"));
  await page.getByRole("button", { name: "Add contact" }).click();

  await expect(page.getByText("This contact wasn't saved")).toBeVisible();
  await expect(page.getByLabel("Full name")).toHaveValue("Nadia Rahman");

  await page.evaluate(() => localStorage.removeItem("docket:simulate-failure"));
  await page.getByRole("button", { name: "Add contact" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Nadia Rahman" })).toBeVisible();
});

test("empty states on the list and the board", async ({ page }) => {
  await page.goto("/contacts");
  await page.getByText("Reviewer tools").click();
  await page.getByRole("button", { name: "Remove all contacts" }).click();

  await expect(page.getByRole("heading", { name: "No one on file yet" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Add the first contact" })).toBeVisible();

  await page.getByRole("link", { name: "Pipeline" }).click();
  await expect(page.getByRole("heading", { name: "The pipeline is empty" })).toBeVisible();
});

test("a second tab picks up changes without a reload", async ({ context, page }) => {
  await page.goto("/contacts");
  await expect(page.getByText("11 people on file.")).toBeVisible();

  const other = await context.newPage();
  await other.goto("/contacts/new");
  await other.getByLabel("Full name").fill("Second Tab");
  await other.getByLabel("Phone").fill("+1 415 555 0000");
  await other.getByLabel("Practice area").selectOption("corporate");
  await other.getByRole("button", { name: "Add contact" }).click();
  await expect(other.getByRole("heading", { level: 1, name: "Second Tab" })).toBeVisible();

  await expect(page.getByText("12 people on file.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Second Tab/ })).toBeVisible();
});

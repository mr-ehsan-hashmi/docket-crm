import { expect, test } from "@playwright/test";

test("validates, then creates a contact that survives a reload", async ({ page }) => {
  await page.goto("/contacts/new");

  await page.getByRole("button", { name: "Add contact" }).click();
  await expect(page.getByText("Enter the person's full name.")).toBeVisible();
  await expect(page.getByText("Add a phone number or an email.")).toBeVisible();
  await expect(page.getByText("Pick the practice area")).toBeVisible();
  await expect(page.getByText("3 fields need attention above.")).toBeVisible();

  await page.getByLabel("Full name").fill("Leila Haddad");
  await page.getByLabel("Email").fill("leila@haddad");
  await page.getByLabel("Email").blur();
  await expect(page.getByText("That email looks incomplete.")).toBeVisible();

  await page.getByLabel("Email").fill("leila@haddad.org");
  await page.getByLabel("Practice area").selectOption("family");
  await page.getByRole("button", { name: "Add contact" }).click();

  await expect(page).toHaveURL(/\/contacts\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { level: 1, name: "Leila Haddad" })).toBeVisible();
  await expect(page.getByText("Leila Haddad added to contacts.")).toBeVisible();
  await expect(page).toHaveTitle(/Leila Haddad/);

  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Leila Haddad" })).toBeVisible();
  await expect(page.getByText("Added to contacts")).toBeVisible();
});

test("warns when the person looks like someone already on file", async ({ page }) => {
  await page.goto("/contacts/new");

  await page.getByLabel("Full name").fill("grace whitlock");
  const warning = page.getByRole("status").filter({ hasText: "Already on file?" });
  await expect(warning).toBeVisible();
  await expect(warning.getByRole("link", { name: /Grace Whitlock/ })).toBeVisible();
  await expect(warning).toContainText("same name");

  await page.getByLabel("Full name").fill("Someone New");
  await expect(warning).toBeHidden();

  await page.getByLabel("Phone").fill("510-555-0178");
  await expect(warning).toContainText("Tomás Villareal");
  await expect(warning).toContainText("same phone");
});

test("asks before leaving a form with unsaved changes", async ({ page }) => {
  await page.goto("/contacts/new");
  await page.getByLabel("Full name").fill("Half Typed");

  page.once("dialog", (dialog) => void dialog.dismiss());
  await page.getByRole("link", { name: "Pipeline" }).click();
  await expect(page).toHaveURL(/\/contacts\/new$/);
  await expect(page.getByLabel("Full name")).toHaveValue("Half Typed");

  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("link", { name: "Pipeline" }).click();
  await expect(page).toHaveURL(/\/pipeline$/);
});

test("edits a contact and records what changed", async ({ page }) => {
  await page.goto("/contacts");
  await page.getByRole("link", { name: /Grace Whitlock/ }).click();
  await page.getByRole("link", { name: "Edit details" }).click();

  await expect(page.getByLabel("Full name")).toHaveValue("Grace Whitlock");
  await page.getByLabel("Phone").fill("+1 628 555 0999");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByText("Changes to Grace Whitlock saved.")).toBeVisible();
  await expect(page.getByRole("link", { name: "+1 628 555 0999" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Activity" })).toContainText("Updated phone");
});

import { expect, test } from "@playwright/test";

test("adds a note and logs it on the timeline", async ({ page }) => {
  await page.goto("/contacts");
  await page.getByRole("link", { name: /Amara Osei/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Amara Osei" })).toBeVisible();

  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.getByText("Write something before saving the note.")).toBeVisible();

  await page.getByLabel("Add a note").fill("Left a voicemail, will try again tomorrow.");
  await page.getByRole("button", { name: "Save note" }).click();

  const notes = page.getByRole("region", { name: "Notes" });
  await expect(notes.getByRole("listitem")).toContainText("Left a voicemail, will try again tomorrow.");
  await expect(page.getByLabel("Add a note")).toHaveValue("");
  await expect(page.getByRole("region", { name: "Activity" })).toContainText("Note added");
});

test("a quiet lead stops being flagged once someone adds a note", async ({ page }) => {
  await page.goto("/contacts");
  await page.getByRole("link", { name: /Priya Raghunathan/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Priya Raghunathan" })).toBeVisible();
  await expect(page.getByText("Quiet for 4 days.")).toBeVisible();

  await page.getByLabel("Add a note").fill("Emailed her the consultation times.");
  await page.getByRole("button", { name: "Save note" }).click();

  await expect(page.getByText("Quiet for 4 days.")).toBeHidden();
});

test("changes status from the detail page", async ({ page }) => {
  await page.goto("/contacts");
  await page.getByRole("link", { name: /Amara Osei/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Amara Osei" })).toBeVisible();

  await page.getByLabel("Status", { exact: true }).selectOption("active");
  await expect(page.getByText("Amara Osei moved to Active.")).toBeVisible();
  await expect(page.getByRole("region", { name: "Activity" })).toContainText("Moved from Lead to Active");
});

test("an unknown contact id gets its own message, not a generic error", async ({ page }) => {
  await page.goto("/contacts/not-a-real-id");
  await expect(page.getByRole("heading", { name: "This contact isn't on file" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to all contacts" })).toBeVisible();
});

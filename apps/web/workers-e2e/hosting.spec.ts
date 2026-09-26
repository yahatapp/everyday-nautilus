import { expect, test } from "@playwright/test";

test("serves the SPA when a nested URL is opened directly", async ({
  page,
}) => {
  const response = await page.goto("/practice/recognition");
  expect(response?.status()).toBe(200);
  expect(response?.headers()["content-type"]).toContain("text/html");
  await expect(page).toHaveTitle("Everyday Nautilus | FTO Practice");
  await expect(
    page.getByRole("button", { name: "スクランブルを生成", exact: true }),
  ).toBeVisible();
});

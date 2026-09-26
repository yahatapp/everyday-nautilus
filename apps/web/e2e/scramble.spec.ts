import { expect, test } from "@playwright/test";

test("generates FTO scrambles through the production worker bundle", async ({
  page,
}, testInfo) => {
  test.setTimeout(60_000);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  if (testInfo.project.name === "mobile-chromium") {
    await page.addInitScript(() => {
      Object.defineProperty(globalThis.crypto, "randomUUID", {
        value: undefined,
      });
    });
  }
  await page.goto("/");
  await expect(page).toHaveTitle("Everyday Nautilus | FTO Practice");
  await page
    .getByRole("button", { name: "スクランブルを生成", exact: true })
    .click();
  const moves = page.getByTestId("scramble-moves");
  await expect(
    page.locator('[data-testid="scramble-moves"], [role="alert"]'),
  ).toBeVisible({ timeout: 45_000 });
  await expect(moves).toHaveText(
    /^(?:U|R|F|D|L|B|BR|BL)'?(?: (?:U|R|F|D|L|B|BR|BL)'?)*$/,
    { timeout: 45_000 },
  );
  await page
    .getByRole("button", { name: "次のスクランブル", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "次のスクランブル", exact: true }),
  ).toBeEnabled({ timeout: 30_000 });
  expect(pageErrors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

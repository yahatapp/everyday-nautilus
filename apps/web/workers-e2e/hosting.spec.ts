import { expect, test } from "@playwright/test";

test("serves the SPA when a nested URL is opened directly", async ({
  page,
}) => {
  const response = await page.goto("/practice/recognition");
  expect(response?.status()).toBe(200);
  expect(response?.headers()["content-type"]).toContain("text/html");
  expect(response?.headers()["x-robots-tag"]).toBe(
    "noindex, nofollow, noarchive",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow, noarchive",
  );
  await expect(page).toHaveTitle("Everyday Nautilus | FTO Practice");
  await expect(
    page.getByRole("button", { name: "スクランブルを生成", exact: true }),
  ).toBeVisible();
});

test("applies noindex to the root page and static files", async ({
  request,
}) => {
  for (const path of ["/", "/robots.txt"]) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(response.headers()["x-robots-tag"]).toBe(
      "noindex, nofollow, noarchive",
    );
  }
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("User-agent: *\nDisallow:\n");
});

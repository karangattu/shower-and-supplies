const { test, expect } = require("@playwright/test");

async function startGame(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin Your Day" }).click();
  await expect(page.locator("#modal-overlay")).toBeHidden();
}

test.describe("Verify Game look and feel", () => {
  test("should play through a basic game loop", async ({ page }) => {
    // Note: We use relative path for local testing, or the hosted URL
    await page.goto("/");
    
    // Verify the new landing poster elements
    await expect(page.locator(".poster-title")).toHaveText("Shower & Supplies");
    await expect(page.locator(".poster-subtitle")).toContainText("Join Hope's Corner");
    
    // Verify instruction cards
    await expect(page.locator(".instruction-card", { hasText: "Manage Showers" })).toBeVisible();
    await expect(page.locator(".instruction-card", { hasText: "Laundry Service" })).toBeVisible();
    await expect(page.locator(".instruction-card", { hasText: "Supply Sort" })).toBeVisible();
    
    // Start the game
    const beginBtn = page.getByRole("button", { name: "Begin Your Day" });
    await expect(beginBtn).toBeVisible();
    await beginBtn.click();
    
    // Verify the game started (modal should be hidden)
    await expect(page.locator("#modal-overlay")).toBeHidden();
    
    // Basic UI checks
    await expect(page.locator("#shower-station")).toBeVisible();
    await expect(page.locator("#laundry-station")).toBeVisible();
    await expect(page.locator("#supply-station")).toBeVisible();
    await expect(page.locator("#guest-station")).toBeVisible();
  });
});

test.describe("Mobile gameplay", () => {
  test("shows a landscape nudge on portrait phones without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.locator("#orientation-nudge")).toBeVisible();
    await expect(page.locator("#orientation-nudge")).toContainText("landscape");

    const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(horizontalOverflow).toBeLessThanOrEqual(2);
  });

  test("uses a compact four-station layout in phone landscape", async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await startGame(page);

    const layout = await page.evaluate(() => {
      const container = document.querySelector("#game-container");
      const columns = getComputedStyle(container).gridTemplateColumns.split(" ").filter(Boolean).length;
      return {
        columns,
        bottom: container.getBoundingClientRect().bottom,
        viewportHeight: window.innerHeight,
        horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
      };
    });

    expect(layout.columns).toBe(4);
    expect(layout.bottom).toBeLessThanOrEqual(layout.viewportHeight + 2);
    expect(layout.horizontalOverflow).toBeLessThanOrEqual(2);
  });

  test("sorts supply drops with taps on touch-sized screens", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await startGame(page);

    await page.getByRole("button", { name: "Accept Donations" }).click();

    const firstSupply = page.locator(".supply-item").first();
    await expect(firstSupply).toBeVisible();

    const supplyId = await firstSupply.getAttribute("id");
    const supplyType = await firstSupply.getAttribute("data-type");
    const stock = page.locator(`#${supplyType}-stock`);
    const stockBefore = Number(await stock.textContent());

    await firstSupply.click();
    await expect(page.locator(`#${supplyId}`)).toHaveClass(/selected/);

    await page.locator(`.supply-bin[data-type="${supplyType}"]`).click();

    await expect(stock).toHaveText(String(stockBefore + 1));
    await expect(page.locator(`#${supplyId}`)).toHaveCount(0);
  });
});

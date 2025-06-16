const { test, expect } = require("@playwright/test");

test.describe("Verify Game look and feel", () => {
  test("should play through a basic game loop", async ({ page }) => {
    await page.goto("https://karangattu.github.io/shower-and-supplies");
    await expect(page.locator("#start-modal")).toMatchAriaSnapshot(`
    - heading "Welcome to Shower & Supplies" [level=1]
    - paragraph: Join Hope's Corner in providing warm showers, laundry services, and essential supplies to our community. Each day brings new challenges—your care and quick thinking will make a difference!
    - heading "How to Play" [level=2]
    - list:
      - listitem: "On Mobile: Tap a guest to select them, then tap an available shower or washer to assign them."
      - listitem: "On Desktop: You can also drag waiting guests (😊) to an available shower or laundry machine."
      - listitem: Click "Accept Donations" then drag supplies to the correct bins.
      - listitem: Click dirty facilities (🧹) to clean them.
      - listitem: After using services, guests will ask for items. Click the item's icon on their request to give it.
      - listitem: Serve guests before they become upset (😠)! Watch the Daily Update for new challenges.
      - listitem: /Call Volunteers \\(\\d+ points\\) when overwhelmed to get help with chores!/
    - button "Begin Your Day"
    `);
    await page.getByRole("button", { name: "Begin Your Day" }).click();
    await expect(page.locator("#shower-station")).toMatchAriaSnapshot(`
    - text: 🚿
    - heading "Shower Stalls" [level=2]
    - text: 🚿 Available 🚿 Available
    `);
    await expect(page.locator("#laundry-station")).toMatchAriaSnapshot(`
    - text: 🧺
    - heading "Laundry" [level=2]
    - text: 🫧 Washing Machine Available 🔥 Dryer Available
    `);
    await expect(page.locator("#supply-station")).toMatchAriaSnapshot(`
    - text: 📦
    - heading "Supplies" [level=2]
    - button "Accept Donations"
    - paragraph: Drag items from here to the bins below
    - text: 👕
    - heading "Shirt" [level=3]
    - paragraph: "2"
    - text: 👖
    - heading "Pants" [level=3]
    - paragraph: "2"
    - text: 🧥
    - heading "Jacket" [level=3]
    - paragraph: "1"
    - text: 🪥
    - heading "Toothbrush" [level=3]
    - paragraph: "2"
    - text: 👟
    - heading "Shoes" [level=3]
    - paragraph: "2"
    - text: 🪒
    - heading "Razor" [level=3]
    - paragraph: "1"
    - text: 🛌
    - heading "Sleeping Bag" [level=3]
    - paragraph: "1"
    `);
    await expect(page.locator("#guest-station")).toMatchAriaSnapshot(`
    - text: 👋
    - heading "Guest Area" [level=2]
    - heading "Waiting for Shower" [level=3]
    - heading "Waiting for Laundry" [level=3]
    - heading "Waiting for Items" [level=3]
    `);
  });
});

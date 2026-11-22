const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.route('https://**/*', route => route.abort());
    await page.clock.install();
});

async function openGame(page, random = 0.45) {
    await page.addInitScript(value => { Math.random = () => value; }, random);
    await page.goto('/');
}

async function startGame(page) {
    await page.getByRole('button', { name: 'Begin Your Day' }).click();
    await page.clock.runFor(1100);
}

async function expectNoHorizontalOverflow(page) {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
}

test('plays a shower, cleans the stall, and fills a request on a laptop', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await openGame(page);
    await expect(page.getByRole('heading', { name: 'Shower & Supplies' })).toBeVisible();
    await expect(page.locator('.instruction-card')).toHaveCount(4);
    await expect(page.getByRole('img', { name: 'Hope’s Corner', exact: true })).toBeVisible();
    await startGame(page);

    const shower = page.locator('#shower-0');
    const guest = page.locator('#guest-1');
    await expect(shower.locator('.sprite')).toHaveCount(0);
    await guest.getByRole('button', { name: 'Start shower' }).press('Enter');
    await expect(shower).toContainText('Showering');
    const sprite = shower.locator('.sprite--shower');
    await expect(sprite).toHaveCSS('animation-name', 'service-frames');
    const frames = await sprite.evaluate(element => {
        const animation = element.getAnimations()[0];
        const duration = animation.effect.getTiming().duration;
        animation.pause();
        const positions = [0, 1, 2, 3].map(index => {
            animation.currentTime = duration * (index + 0.5) / 4;
            return getComputedStyle(element).backgroundPositionX;
        });
        animation.play();
        return positions;
    });
    expect(new Set(frames).size).toBe(4);
    expect((await page.request.get('/assets/service-sprites.webp')).ok()).toBe(true);
    await page.clock.runFor(10_100);
    await expect(shower).toContainText('Clean now');
    await expect(page.locator('#score')).toHaveText('50');
    await shower.click();
    await expect(shower.locator('.sprite--cleaning')).toBeVisible();
    await guest.getByRole('button', { name: 'Give Toothbrush' }).click();
    await expect(page.locator('#served')).toHaveText('1');
    await expect(page.locator('#score')).toHaveText('75');
    await page.clock.runFor(6100);
    await expect(shower).toContainText('Available');

    const images = page.locator('img:visible');
    await expect.poll(() => images.evaluateAll(elements => elements.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
    const gameText = await page.locator('body').innerText();
    expect(gameText).not.toMatch(/\p{Extended_Pictographic}/u);
    await expectNoHorizontalOverflow(page);
});

test('supports guest and donation drag and drop', async ({ page }) => {
    await openGame(page);
    await startGame(page);
    await page.locator('#guest-1 .guest').dragTo(page.locator('#shower-1'));
    await expect(page.locator('#shower-1')).toContainText('Showering');

    await page.getByRole('button', { name: 'Accept Donations' }).click();
    await page.locator('#supply-1').dragTo(page.locator('.supply-bin[data-type="toothbrush"]'));
    await expect(page.locator('#toothbrush-stock')).toHaveText('3');
    await expect(page.locator('#score')).toHaveText('15');
});

test('pauses cycle and patience timers while help or scores are open', async ({ page }) => {
    await page.route('https://script.google.com/**', route => route.fulfill({
        json: { success: true, data: [{ playerName: 'Alex', score: 350 }] }
    }));
    await openGame(page, 0.15);
    await startGame(page);

    const guest = page.locator('#guest-1');
    await guest.getByRole('button', { name: 'Start wash' }).click();
    await page.getByRole('button', { name: 'Pause' }).click();
    await expect(page.locator('#washer .sprite--washer')).toHaveCSS('animation-play-state', 'paused');
    await page.clock.runFor(20_000);
    await expect(page.locator('#washer')).toContainText('Washing');
    await page.getByRole('button', { name: 'Resume shift' }).click();

    await page.clock.runFor(12_100);
    await expect(guest).toContainText('Ready to dry');
    await guest.getByRole('button', { name: 'Move to dryer' }).click();
    await expect(page.locator('#dryer .sprite--dryer')).toBeVisible();
    await page.getByRole('button', { name: 'Leaderboard' }).click();
    await expect(page.getByRole('cell', { name: 'Alex' })).toBeVisible();
    await page.clock.runFor(12_000);
    await expect(page.locator('#dryer')).toContainText('Drying');
    await page.getByRole('button', { name: 'Close', exact: true }).click();

    await page.clock.runFor(8100);
    await guest.getByRole('button', { name: 'Give Pants' }).click();
    await expect(page.locator('#score')).toHaveText('100');
    await page.getByRole('button', { name: 'Accept Donations' }).click();
    await page.getByRole('button', { name: 'Call volunteers' }).click();
    await expect(page.locator('#volunteer-sprite')).toBeVisible();
    await expect(page.locator('.supply-item')).toHaveCount(0);
    await expect(page.locator('#pants-stock')).toHaveText('5');
    await page.clock.runFor(1100);
    await expect(page.locator('#washer')).toContainText('Available');
    await expect(page.locator('#dryer')).toContainText('Available');
    await expect(page.locator('#score')).toHaveText('50');
});

test('allows voluntary score submission and starts a fresh shift', async ({ page }) => {
    let submitted;
    await page.route('https://script.google.com/**', route => {
        submitted = route.request().postDataJSON();
        return route.fulfill({ json: { success: true } });
    });
    await openGame(page);
    await startGame(page);
    await page.getByRole('button', { name: 'Accept Donations' }).click();
    await page.locator('#supply-1').click();
    await page.getByRole('button', { name: 'Toothbrush bin' }).click();

    await page.clock.runFor(65_000);
    const summary = page.getByRole('dialog', { name: 'Shift complete' });
    await expect(summary).toBeVisible();
    await expect(summary.locator('#final-score')).toHaveText('15');
    expect(submitted).toBeUndefined();
    await summary.getByRole('textbox', { name: 'Name for the leaderboard' }).fill('Alex');
    await summary.getByRole('button', { name: 'Save score' }).click();
    await expect(summary.getByRole('status')).toHaveText('Score saved to the leaderboard.');
    expect(submitted).toEqual({ action: 'submit', playerName: 'Alex', score: 15 });

    await summary.getByRole('button', { name: 'Play Again' }).click();
    await expect(summary).toBeHidden();
    await expect(page.locator('#score')).toHaveText('0');
    await expect(page.locator('#toothbrush-stock')).toHaveText('2');
});

test.describe('Touch gameplay', () => {
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

    test('uses the portrait board with taps for guests and supplies', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await openGame(page);
        await expectNoHorizontalOverflow(page);
        await page.getByRole('button', { name: 'Begin Your Day' }).tap();
        await page.clock.runFor(1100);

        const navigation = page.getByRole('navigation', { name: 'Game stations' });
        await page.locator('#guest-1 .guest').tap();
        await navigation.getByRole('link', { name: 'Services' }).tap();
        await expect(page.locator('#shower-1')).toHaveClass(/tap-target/);
        await page.locator('#shower-1').tap();
        await expect(page.locator('#shower-1')).toContainText('Showering');
        await expect(page.locator('#shower-1 .sprite--shower')).toHaveCSS('animation-name', 'none');

        await navigation.getByRole('link', { name: 'Supplies' }).tap();
        await page.getByRole('button', { name: 'Accept Donations' }).tap();
        await page.locator('#supply-1').tap();
        await expect(page.locator('#supply-1')).toHaveAttribute('aria-pressed', 'true');
        await page.getByRole('button', { name: 'Toothbrush bin' }).tap();
        await expect(page.locator('#toothbrush-stock')).toHaveText('3');
        await expect(page.locator('#supply-1')).toHaveCount(0);
        await expectNoHorizontalOverflow(page);
    });

    test('reflows in landscape and keeps every station reachable', async ({ page }) => {
        await page.setViewportSize({ width: 844, height: 390 });
        await openGame(page);
        await startGame(page);
        for (const id of ['guest-station', 'shower-station', 'laundry-station', 'supply-station']) {
            await expect(page.locator('#' + id)).toBeVisible();
        }
        await expectNoHorizontalOverflow(page);
    });
});

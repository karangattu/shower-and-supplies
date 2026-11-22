# Shower & Supplies

Run a volunteer shift in a browser game inspired by [Hope’s Corner’s Shower & Laundry Program](https://www.hopes-corner.org/shower-laundry-program). Help guests get a shower, wash and dry their laundry, and give them the supplies they request.

## Play

- Use the action on a guest’s card to start their next service. You can also select the guest and then select a station, or drag the guest on a laptop.
- Clean a stall or machine after each use. Some guests come straight for supplies. Select each requested item on their card.
- Accept donations and select an item, then select its matching bin. Dragging items to bins also works.
- Spend 50 points to call volunteers. They clean stations, sort donations, and reduce stress.
- Use **Pause** for a break or to review the controls. The shift ends at 100% stress or when five guests leave after waiting too long.

The game animates active equipment and volunteers. It shows still frames when reduced motion is enabled on your device.

## Run locally

Use `npm ci` to install the test dependencies. Run `node tests/static-server.js` and open [the local game](http://127.0.0.1:41731). To run the Playwright tests, install Chromium with `npx playwright install chromium`, then run `npm test`.

## Credits

Game design and code by Karan. The illustrations and sprites in [assets](assets/) were made for this game with ImageGen. The [art prompts](assets/art-prompts.md) document each illustration. The Hope’s Corner logo comes from the organization. This game is for educational and demonstration purposes.

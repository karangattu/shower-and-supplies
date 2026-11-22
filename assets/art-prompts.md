# ImageGen prompts

The built-in ImageGen tool generated the artwork. The game serves compressed WebP copies.

## Opening illustration

The opening screen uses `community-center.webp`.

```text
Use case: illustration-story. Create a wide landscape illustration for the opening screen of an original neighborhood service management game, Shower & Supplies. A warm sunny community center supply room, charming editorial picture-book illustration, soft gouache on slightly textured paper, crisp mid-century forms with warm navy outlines. A friendly Black woman volunteer in teal apron on the middle-left hands a neatly folded stack of sunny apricot and teal towels to a smiling brown-skinned older neighbor on the middle-right, a teal front-loading washer with round door anchors lower left, pale yellow shelves with folded textiles and unmarked cardboard supply cartons at right, simple window with plants and warm daylight behind them. Both adults fully clothed. Deep ink navy, muted petrol teal, dusty blue, warm ivory, peach and marigold. Friendly sophisticated illustrated board-game art with full-bleed edge-to-edge composition and focal subjects comfortably inside margins. Artwork only, no typography, no lettering, no logos, no border or UI. Wide 3:2 framing.
```

## Game sprites

Each sprite used the shared prompt below followed by its subject. ImageGen’s transparent background option was on.

```text
Use case: stylized-concept. Create an original square game sprite asset, one centered object at a readable silhouette, compact subject enclosed within the middle 78% of the square. Sophisticated illustrated board-game art: classic gouache editorial illustration on lightly textured surfaces, crisp deep navy fine outlines, softly modeled shape with gentle warm natural light from top left. Palette deep navy, petrol teal, dusty blue, marigold, peach and warm cream. No words, no labels, no numerals, no emojis, no ground plane, no surrounding scene. True transparent background around the object, with clear margins on all sides. Asset subject:
```

| Asset | Subject |
| --- | --- |
| `shirt.webp` | A front view of one neatly folded coral crew-neck T-shirt, its sleeves and ribbed neckline still clearly visible. |
| `pants.webp` | One pair of blue denim pants in full view, legs forming an unmistakable clean silhouette, with gold seam details. |
| `jacket.webp` | One golden yellow hooded rain jacket in full view, facing forward with teal zipper and drawstrings. |
| `toothbrush.webp` | One diagonal turquoise toothbrush, clear ivory bristles, alongside one small peach and ivory toothpaste tube, no lettering. |
| `shoes.webp` | One pair of teal lace-up walking sneakers with ivory soles and short orange accents, slightly overlapping. |
| `razor.webp` | One diagonal manual safety razor with a turquoise grip and recognizable wide dark razor head, next to a small cream cap. |
| `sleeping-bag.webp` | One rolled-up warm orange sleeping bag with deep teal straps and visible spiral of fabric at its open circular end. |
| `shower.webp` | A compact wall-mounted warm brass shower head and curved fixture, angled right spraying a few turquoise streams of water, mounted against a small square of four porcelain-blue tiles. |
| `washer.webp` | One compact front-loading washing machine, teal enamel casing, dark blue glass porthole showing water and suds, angled slightly toward the right, no lettering. |
| `dryer.webp` | One compact front-loading clothes dryer, warm terracotta enamel casing, dark glass porthole showing a folded ivory towel, angled slightly toward the right, no lettering. |
| `laundry.webp` | One squat woven honey-colored laundry basket heaped with folded dusty-blue, creamy white, and orange towels. |
| `donations.webp` | One open cardboard donation box filled with neatly folded blue and orange clothes and a hand soap bottle, simple solid dark teal painted heart mark on the front. |
| `guest-welcome.webp` | A warmly expressive bust portrait of a middle-aged Black woman with deep brown skin, short natural curls and a pumpkin-colored knit sweater, eyes open and dignified calm expression. Circular dusty teal backdrop immediately around portrait, transparent outside the circle. |
| `guest-beanie.webp` | A warmly expressive bust portrait of a middle-aged light brown-skinned man with dark cropped hair, short beard, navy blue beanie and a teal collared shirt, eyes open and dignified calm expression. Circular light apricot backdrop immediately around portrait, transparent outside the circle. |
| `guest-glasses.webp` | A warmly expressive bust portrait of an older East Asian woman with silver bobbed hair, glasses and a dusty blue shirt, eyes open and dignified calm expression. Circular gold backdrop immediately around portrait, transparent outside the circle. |
| `volunteers.webp` | Bust portrait of two friendly adult neighborhood volunteers shoulder to shoulder in deep teal aprons, a dark-skinned woman with natural curls and lightly tanned man with short hair. A small cream heart between their shoulders. Isolated as one cohesive graphic. |
| `cleaning-kit.webp` | One apricot spray cleaning bottle with dark teal trigger and a neatly folded pale blue cleaning cloth at its base. Two small graphic four-point stars at its upper right. |
| `rainy-day.webp` | One half sun with golden rays peeking out behind two pale blue rounded clouds and a trio of soft teal rain drops, clear silhouette for a daily weather bulletin. |
| `trophy.webp` | One small gold cup trophy with side handles on a petrol teal base, embossed circle in its center, no letters. |
| `calm-day.webp` | A small neighborhood center under a pale blue sky, a mustard door flanked by two teal windows, one rounded tree, and clear, calm morning light. The miniature building and tree form one compact graphic. |
| `water-heater.webp` | A small cream wall-mounted water heater with curved copper pipes, one dark teal control dial, and a little apricot indicator. Clear water-heater silhouette. |
| `delivery.webp` | A compact warm mustard delivery van carrying community donations, angled slightly toward viewer with clean dark navy wheels, soft teal window, neat cardboard box visible through an open rear door. One cohesive isolated object. |
| `hot-day.webp` | A vivid marigold summer sun with a crisp circular core, clean radiating strokes and two small muted coral heat-wave lines at the bottom right. A distinctive miniature weather illustration. |
| `tools.webp` | One small navy metal wrench at a diagonal beside a short coral-handled screwdriver and a brass nut, carefully arranged into a compact legible shape. Illustrated tools, no letters. |

## Animation sprite sheet

`service-sprites.webp` packs five ImageGen sequences into rows of four 160 px frames. Rows run in order from shower to washer, dryer, cleaning, and volunteers. Each sequence used the matching still illustration as its reference.

```text
Use case: stylized-concept. Create a four-frame animation sprite sheet based on the supplied illustrated game icon as a style and identity reference. Exact 2 by 2 evenly spaced square grid on a fully transparent canvas, four sequential frames read top-left, top-right, bottom-left, bottom-right. Each cell is its own complete small icon. Center the artwork in each cell, keep ample empty padding around each sprite and the cell boundaries, keep the same asset proportions, view angle, scale, physical position, lighting and gouache palette across all four frames. The four frames should loop smoothly, with motion localized to the specific action below. Keep dark navy outlines, warm editorial gouache texture and clear silhouettes at 60 pixels. No visible grid, dividers, numbers, text, borders, emoji, outer shadow or scenery. Actual transparency.
```

| Row | Action prompt |
| --- | --- |
| Shower | Use the same brass shower fixture with the porcelain-blue tiled panel from the reference. Keep the metal and tile rigid and in the exact same position in all four frames. Animate only the turquoise running water as four sequential phases of fresh droplets and subtly shifting water trails, with clearly different droplet positions beneath the nozzle. |
| Washer | Use the exact same teal front-loading washing machine from the reference. Keep the casing, door outline, brass controls and feet rigid, in the exact same position in each frame. Animate only what is behind the glass: clearly visible foam, a cream fabric shape and blue water slosh around the circular porthole in a four-phase clockwise spin. |
| Dryer | Use the exact same terracotta front-loading clothes dryer from the reference. Keep the casing, door outline, gold controls and feet rigid, in the exact same position in every frame. Animate only what is behind the porthole glass: one cream towel tumbles, clearly positioned at the bottom, left, upper-middle, and right in the four sequential frames. |
| Cleaning | Use the exact small coral and teal cleaning spray bottle and folded blue rag from the reference. Keep the bottle body and cloth in the exact same place and same proportions across all four frames. Animate a light mint jet and small golden four-point glints that appear, grow and recede above the cloth and to the right of the nozzle. Make the twinkles read at a tiny display size. |
| Volunteers | Keep the same two friendly adult volunteers in petrol teal aprons, preserving their faces, clothing, poses and positions in all four frames. Animate the small floating cream peach heart between their shoulders rising and growing gently, with two miniature golden flecks appearing for a moment beside it, then returning to the initial heart size. Keep the heart distinct and readable at 56 pixels. The portraits remain still. |

### Cleaning sprite correction

```text
Use case: precise-object-edit. Correct the spray direction on this exact four-frame cleaning sprite sheet. The replacement must have the identical 2-by-2 frame grid, positions, coral bottle and label, teal trigger and nozzle head, blue cloth, transparent canvas and gouache illustration style. The bottle’s working nozzle is the small flat rectangular cap on the LEFT end of the teal horizontal head, directly above the curved teal trigger. The three mint mist droplets MUST originate just outside that LEFT nozzle face and travel toward the LEFT edge of the cell, away from the bottle. The pointed stream tails are nearest the left nozzle face and the rounded tips face LEFT. Completely erase any mist, streaks, glints or droplets on the RIGHT side of the teal spray head. Two little gold four-point glints may appear only to the LEFT of the mist in larger frames. Keep the bottle and cloth perfectly registered in all four frames. Four phases: short mist, medium mist, widest mint mist with two gold twinkles, back to short mist. Maintain ample clear border around every cell, especially on the left. True transparent background, no labels beyond the original painted fruit art, no grid, no text. Only the LEFT side can emit spray.
```



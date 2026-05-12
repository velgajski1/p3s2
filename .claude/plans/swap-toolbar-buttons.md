---
name: Swap toolbar buttons to new asset set
description: Replace existing toolbar artwork with `newassets/menu/`, add help/stats/night icons, drop Menu hamburger, use mobile- variants on mobile (both orientations)
---

# Context

The user dropped a new button asset set into `newassets/menu/` (Phaser Klondike game in `d:\Projects\p3s2`). Coverage:
- Desktop: `btn-1-card-off/on` + `-hover` (110×54), `btn-3-card-off/on` + `-hover` (110×54), `btn-hint` + `-hover` (220×54), `btn-undo` + `-hover` (220×54), `icon-settings/help/stats/night` + `-hover` (54×54).
- Mobile: `mobile-btn-1-card-off/on`, `mobile-btn-3-card-off/on`, `mobile-btn-hint`, `mobile-btn-undo` (all 54×54, no hover variants).
- No replacement for the existing Menu (hamburger) button (currently 44×38).
- Existing toolbar art was 38-44px tall and 44-65px wide — **new desktop art is roughly 1.4× taller and up to 3.4× wider** (hint/undo went from 64→220px). Layout must be recomputed.

Decisions confirmed:
- Replace Menu hamburger with help + stats + night standalone icons. MainMenu items (Restart, New Game 1/3, All Games) move into Settings.
- Use mobile- assets on mobile in **both** orientations (portrait currently uses the desktop container scaled 3.5× — that path must change).
- Night icon rendered with a no-op click handler; final behavior TBD.

The pipeline is favorable: buttons load as standalone PNGs in Preloader. No atlas regen, no `tpacker` change. Webpack copies `public/assets/` to `dist/assets/` verbatim.

# Blockers identified in first-pass review (each addressed below)

1. **Desktop layout will overlap.** Old positions and `ToggleSwitch` `itemDeltaX = 81` ([UIScene.ts:70](src/scenes/UIScene.ts#L70)) were sized for 44-65px-wide icons. New 1-card/3-card icons are 110px wide — 81 puts them on top of each other. Hint/undo at 220px wide blow past any old 60-80px gap.
2. **Mobile portrait uses the desktop container.** `handleMobilePortrait()` ([UIScene.ts:357](src/scenes/UIScene.ts#L357)) sets `elementsContainer.visible = true` and scales by 3.5×. The desktop layout/art would still show in portrait, defeating "use mobile-* on mobile".
3. **Toolbar button fields are overwritten by the mobile setup.** Both `createUIElements()` and `createUIElementsMobile()` assign to the same `this.menuBut`/`settingsBut`/`hintBut`/`undoBut`/`toggleSwitch` fields ([UIScene.ts:23-30, 98-141, 176-222](src/scenes/UIScene.ts#L23-L30)). Mobile runs second, so the `DRAG_ACTIVE` enable/disable block at [UIScene.ts:240-254](src/scenes/UIScene.ts#L240-L254) only controls the mobile instances even on desktop.
4. **GameOver scene starts MainMenu.** [GameOver.ts:31](src/scenes/GameOver.ts#L31) → `this.scene.start('MainMenu')`. GameOver is registered in [main.ts:53](src/main.ts#L53) but appears unreachable from gameplay (no callers found in grep). MainMenu scene remains **registered** in this pass, so the reference still resolves; we just stop wiring MainMenu into the toolbar.

# Approach

## 1. Assets

Create `public/assets/menu/` and move every file from `newassets/menu/` into it. Rename the one outlier — `btn-1-card-off.hover.png` → `btn-1-card-off-hover.png` — for consistency with the other `-hover.png` files.

Delete obsolete originals from `public/assets/`: `hint.png`, `undo.png`, `settings.png`, `menu.png`, `klondike_1_turn.png`, `klondike_1_turn_selected.png`, `klondike_3_turn.png`, `klondike_3_turn_selected.png`.

## 2. Preloader — [src/scenes/Preloader.ts](src/scenes/Preloader.ts)

Replace [lines 96-116](src/scenes/Preloader.ts#L96-L116) with the new key set. **Load all keys unconditionally** — both desktop and mobile (`mobile-btn-*`) — because [UIScene.create()](src/scenes/UIScene.ts#L57-L59) calls **both** `createUIElements()` and `createUIElementsMobile()` regardless of device. If mobile loads were gated on `isMobile`, desktop builds would construct the mobile widgets and reference missing `mobile-btn-*` textures (green-box render). The extra 6 small PNGs are negligible load cost.

Keys to load:
- Desktop set: 8 `icon-*` + 8 `icon-*-hover`, `btn-hint`/`btn-hint-hover`, `btn-undo`/`btn-undo-hover`, `btn-1-card-off/on` + `-hover`, `btn-3-card-off/on` + `-hover`.
- Mobile set: `mobile-btn-1-card-off/on`, `mobile-btn-3-card-off/on`, `mobile-btn-hint`, `mobile-btn-undo`.

**Remove**: `hint`, `klondike_1_turn`, `klondike_1_turn_selected`, `klondike_3_turn`, `klondike_3_turn_selected`, `menu`, `settings`, `undo`.

## 3. UIScene — [src/scenes/UIScene.ts](src/scenes/UIScene.ts)

### 3a. Refactor: structured refs to fix the field-overwrite bug (blocker 3)

Replace flat per-button fields with two grouped objects so desktop and mobile widgets don't trample each other (the current code overwrites `this.menuBut` etc. in the mobile path, breaking the `DRAG_ACTIVE` toggle on the visible desktop set):

```ts
private desktopUI: {
  toggle: ToggleSwitch, settings: ImageButton, help: ImageButton,
  stats: ImageButton, night: ImageButton, hint: ImageButton, undo: ImageButton
};
private mobileUI: {
  toggle: ToggleSwitch, settings: ImageButton, help: ImageButton,
  stats: ImageButton, night: ImageButton, hint: ImageButton, undo: ImageButton
};
```

The `update()` block at [UIScene.ts:240-254](src/scenes/UIScene.ts#L240-L254) iterates the **currently visible** set:

```ts
const ui = this.elementsContainer.visible ? this.desktopUI : this.mobileUI;
const all = [ui.settings, ui.help, ui.stats, ui.night, ui.hint, ui.undo];
all.forEach(b => DRAG_ACTIVE ? b.disableInteractive() : b.setInteractive());
DRAG_ACTIVE ? ui.toggle.icon1.disableInteractive() : ui.toggle.icon1.setInteractive();
DRAG_ACTIVE ? ui.toggle.icon2.disableInteractive() : ui.toggle.icon2.setInteractive();
```

Named refs (rather than arrays) are required because mobile portrait needs to reposition individual children by role (see 3d below).

### 3b. Desktop — [createUIElements()](src/scenes/UIScene.ts#L66-L145)

New layout (all `setOrigin(0,0)`, x measured left-edge, relative to container; container is right-anchored via `Registry.uiElemStartX`):

| Element            | Texture (normal / hover)                     | Width | X      |
|--------------------|----------------------------------------------|-------|--------|
| ToggleSwitch icon1 | `btn-1-card-off` / `btn-1-card-on` (toggle)  | 110   | -955   |
| ToggleSwitch icon2 | `btn-3-card-off` / `btn-3-card-on` (toggle)  | 110   | -840   |
| Settings           | `icon-settings` / `icon-settings-hover`      | 54    | -720   |
| Help               | `icon-help` / `icon-help-hover`              | 54    | -660   |
| Stats              | `icon-stats` / `icon-stats-hover`            | 54    | -600   |
| Night              | `icon-night` / `icon-night-hover`            | 54    | -540   |
| Hint               | `btn-hint` / `btn-hint-hover`                | 220   | -465   |
| Undo               | `btn-undo` / `btn-undo-hover`                | 220   | -240   |

Right edge ≈ -20. Total span ≈ 935px. ToggleSwitch `itemDeltaX` argument bumps from `81` → `115` to clear the 110px icon width with a 5px gap. These are starting values; final spacing may need ±10-20px tuning in implementation (load it, eyeball at 1600×900, adjust).

- `ToggleSwitch` keys swap to `btn-1-card-off/on` and `btn-3-card-off/on`. (Toggle ignores hover variants today — extending it is **not in this pass**.)
- `menuBut` block ([lines 98-113](src/scenes/UIScene.ts#L98-L113)) is deleted entirely.
- `settingsBut`/`hintBut`/`undoBut` get distinct normal/hover keys for the first time — real hover swap will start working ([ImageButton.ts:25-26](src/ui/ImageButton.ts#L25-L26)).
- New `helpBut`/`statsBut`/`nightBut`:
  - Help: `window.open('/posts/posts-guides/klondike-solitaire-rules', '_blank')` (lifted from [MainMenu.howToPlay](src/scenes/MainMenu.ts#L188-L191)).
  - Stats: `this.scene.launch("Statistics").bringToTop("Statistics")` (lifted from [MainMenu.statistics](src/scenes/MainMenu.ts#L193-L200)).
  - Night: `() => {}` placeholder. Click sound still plays via `ImageButton`'s built-in handler ([ImageButton.ts:35](src/ui/ImageButton.ts#L35)).

### 3c. Mobile — [createUIElementsMobile()](src/scenes/UIScene.ts#L147-L226)

All mobile art is 54×54 (square), so the same button instances can be repositioned for landscape vs portrait without resizing. Two containers, `elementsContainer2` (right-side cluster) + `elementsContainer3` (left-side cluster), are kept. The current "ec3 mirrors ec2" pattern in [update() lines 230-231](src/scenes/UIScene.ts#L230-L231) (scale + visibility coupling) is preserved.

**Button creation** (default = landscape positions; portrait re-positions via `setXY` at runtime — see 3d):

| Container | Element  | Texture (normal / hover)              | x local | y local |
|-----------|----------|---------------------------------------|---------|---------|
| ec2 right | Toggle 1 | `mobile-btn-1-card-off/on`            | -80     | 0       |
| ec2 right | Toggle 2 | `mobile-btn-3-card-off/on` (itemDeltaX=0, itemDeltaY=55) | -80 | 55 |
| ec2 right | Hint     | `mobile-btn-hint` / same key as hover | -80     | 110     |
| ec2 right | Undo     | `mobile-btn-undo` / same key as hover | -80     | 165     |
| ec3 left  | Settings | `icon-settings` / `icon-settings-hover` | 20    | 0       |
| ec3 left  | Help     | `icon-help` / `icon-help-hover`       | 20      | 55      |
| ec3 left  | Stats    | `icon-stats` / `icon-stats-hover`     | 20      | 110     |
| ec3 left  | Night    | `icon-night` / `icon-night-hover`     | 20      | 165     |

- Keep `ToggleSwitch` constructor args `itemDeltaX=0, itemDeltaY=55` — preserves current mobile vertical-stack of the two toggle states (matches existing UX).
- Mobile- art has no hover variants — pass same key for `normalTexture` and `hoverTexture` (matches current pattern, mobile doesn't fire `pointerover` reliably anyway).
- Settings/help/stats/night use the **desktop** `icon-*` keys (no `mobile-*` exists for those in the new set).
- `menuBut` block at [lines 176-191](src/scenes/UIScene.ts#L176-L191) deleted.
- Each created widget is also stored on `this.mobileUI.<role>` (refs needed for portrait re-layout).

### 3d. Mobile portrait fix (blocker 2 + the follow-up review's positioning errors) — [handleMobilePortrait()](src/scenes/UIScene.ts#L357-L373) and [updateTextPos()](src/scenes/UIScene.ts#L396-L461)

User intent for portrait: **single horizontal toolbar row at the bottom of the screen** (matches today's "buttons-at-bottom" feel; today that's the desktop container scaled 3.5×, which is wrong — should be mobile-* art).

Mobile assets are all 54×54 squares → 7 buttons + toggle (2 squares vertical = 1 horizontal slot of 54px) → 7 horizontal slots × 54 + 6 gaps × 8 = ~426px raw width. At a portrait base scale of ~0.8 that's ~340px, fits a 375px iPhone width.

Replace [handleMobilePortrait()](src/scenes/UIScene.ts#L357-L373) entirely:

```ts
handleMobilePortrait() {
  this.elementsContainer.visible = false;
  this.elementsContainer2.visible = true;
  this.elementsContainer3.visible = true;
  // ec2 + ec3 scale chosen to fit the row in viewport width
  const scaleFactor = Math.min(2.0, window.innerWidth / 500);
  this.elementsContainer2.scale = scaleFactor;
  this.elementsContainer3.scale = scaleFactor;

  // Lay out left cluster (ec3: settings/help/stats/night) horizontally at world X starting at left edge
  this.mobileUI.settings.setXY(  0, 0);
  this.mobileUI.help.setXY    ( 60, 0);
  this.mobileUI.stats.setXY   (120, 0);
  this.mobileUI.night.setXY   (180, 0);
  this.elementsContainer3.x = 10;  // small left padding

  // Lay out right cluster (ec2: toggle/hint/undo) horizontally, anchored at right edge
  // Toggle becomes side-by-side (2 squares) instead of stacked; reposition icon2
  this.mobileUI.toggle.setPosition(0, 0);
  this.mobileUI.toggle.icon1.setPosition(0, 0);
  this.mobileUI.toggle.icon2.setPosition(60, 0);
  this.mobileUI.hint.setXY(120, 0);
  this.mobileUI.undo.setXY(180, 0);
  // Right-align: container at right edge minus its design width (4 slots * 60 = 240) * scale
  this.elementsContainer2.x = window.innerWidth - (240 * scaleFactor) - 10;

  this.textContainer.scale = 1.2;
  this.movesText.visible = false;
}
```

(Toggle's icon2 has a public `setPosition` via Phaser `Image`; verify by reading [ToggleSwitch.ts](src/ui/ToggleSwitch.ts) — both `icon1`/`icon2` are public `Phaser.GameObjects.Image`, so direct `setPosition` works.)

**[updateTextPos()](src/scenes/UIScene.ts#L396-L461) fix**: The portrait branch at [lines 444-459](src/scenes/UIScene.ts#L444-L459) only sets `elementsContainer.y`. Mirror those assignments to `elementsContainer2.y` and `elementsContainer3.y` so the mobile containers also move to the bottom in portrait. Concretely add `elementsContainer2.y = elementsContainer3.y = elementsContainer.y` after each `elementsContainer.y = ...` line in that branch (and in the iPad-portrait inner branch).

Also: in [handleMobileLandscape()](src/scenes/UIScene.ts#L327-L356), `elementsContainer3.x` is **never set** — it stays at 0, which currently puts ec3 children on the LEFT edge of the screen. That happens to be the design intent for the left cluster, but it's accidental. Make it explicit: add `this.elementsContainer3.x = 0;` next to the existing `this.elementsContainer2.x = window.innerWidth;` for clarity. (The user's review flagged my earlier proposal that incorrectly set ec3.x = innerWidth — that would have pushed ec3's children off-screen right; the correct landscape position keeps ec3 on the LEFT.)

## 4. Settings — [src/scenes/Settings.ts](src/scenes/Settings.ts)

Add a "Game" section at the top with four buttons before "Game Settings":

- Restart (`UndoManager.getInstance().undoFully()` + `GameManager.reset()` — from [MainMenu.restartThisGame](src/scenes/MainMenu.ts#L162-L174))
- New Game (1 card) (`toggleThreeModeActive(false); this.restartGame()` — from [MainMenu.newGame1](src/scenes/MainMenu.ts#L176-L180))
- New Game (3 card) (`toggleThreeModeActive(true); this.restartGame()` — from [MainMenu.newGame3](src/scenes/MainMenu.ts#L182-L186))
- All Games (`window.open('/solitaire-games', '_blank')` — from [MainMenu.allGames](src/scenes/MainMenu.ts#L202-L208))

Use the existing `Button` widget already imported at [Settings.ts:2](src/scenes/Settings.ts#L2). Grow `whiteBg` rounded-rect height in [createWhiteBackground()](src/scenes/Settings.ts#L67-L71) by ~+260px and shift existing radio buttons + visual title down accordingly. `scaleMenuContainer()` divider may need bumping from 600 → 850 ([Settings.ts:139-140](src/scenes/Settings.ts#L139-L140), and the duplicate at [186-187](src/scenes/Settings.ts#L186-L187)) so the taller modal still fits small viewports.

`restartGame()` lives on `BaseMenuScene` — confirm by glancing at the base class; if not, lift the implementation alongside the handlers.

## 5. Leave alone in this pass

- [ImageButton.ts](src/ui/ImageButton.ts) and [ToggleSwitch.ts](src/ui/ToggleSwitch.ts) — constructors are flexible enough; no changes needed.
- [MainMenu.ts](src/scenes/MainMenu.ts) — stays in the repo, stays registered in [main.ts:47](src/main.ts#L47), but no longer reachable from the toolbar. This keeps [GameOver.ts:31](src/scenes/GameOver.ts#L31) compiling and the scene available as a quick revert. Cleanup (delete MainMenu, retarget GameOver) is a **follow-up**.
- `loadAssets.js`, `tpacker/`, webpack config — no changes.

# Critical files

- [src/scenes/Preloader.ts](src/scenes/Preloader.ts)
- [src/scenes/UIScene.ts](src/scenes/UIScene.ts)
- [src/scenes/Settings.ts](src/scenes/Settings.ts)
- [src/scenes/MainMenu.ts](src/scenes/MainMenu.ts) (read-only, source of handlers)
- `public/assets/menu/` (new — destination)
- `newassets/menu/btn-1-card-off.hover.png` (rename before move)

# Verification

1. `npm run dev` — webpack dev server.
2. **Desktop @ 1600×900** (browser at native size): toggle, settings, help, stats, night, hint, undo render side by side with no overlap. Right edge near the existing position.
3. **Desktop hover**: each `ImageButton` swaps to its `-hover` texture on mouseover, swaps back on mouseout.
4. **Desktop clicks**:
   - 1-card/3-card → game restarts in new mode (existing behavior).
   - Settings → modal opens, has 4 new top buttons (Restart, NewGame1, NewGame3, AllGames) above the radio buttons. Each works.
   - Help → new tab opens to how-to-play URL.
   - Stats → Statistics scene launches over gameplay.
   - Night → no error, click sound plays, nothing else happens.
   - Hint → hint plays.
   - Undo → undo executes.
5. **Drag interaction**: pick up a card and start dragging. Toolbar buttons should be non-interactive mid-drag (verifies blocker 3 fix — currently desktop buttons stay clickable during drag because the wrong array is being disabled).
6. **Mobile emulator landscape** (DevTools, iPhone 13 landscape): mobile-* art on toggle/hint/undo; `icon-*` art on settings/help/stats/night; 2-column flanking layout fits without overlap. Left column (settings/help/stats/night) on left edge, right column (toggle/hint/undo) on right edge.
7. **Mobile emulator portrait** (iPhone 13 portrait): all 7 buttons in a single horizontal row at the bottom of the screen; no desktop art visible (verifies blocker 2 fix). Toggle renders as 2 side-by-side squares within the row, not stacked. Buttons fit screen width with margin to spare.
8. **Real device** if available — Safari iOS especially, since `pointerover` is unreliable there (the hover swap may not fire, but `pointerdown` still must work).

# Out of scope

- Deleting `MainMenu.ts` and retargeting [GameOver.ts:31](src/scenes/GameOver.ts#L31). Follow-up PR.
- Real behavior for night icon. Placeholder no-op for now.
- Hover variants on `ToggleSwitch`. Future polish; not required by the asset set's intent (the on/off swap is the visual feedback).
- Atlas-packing the new menu PNGs (currently 20+ standalone PNG loads). Reasonable optimization but separate concern.

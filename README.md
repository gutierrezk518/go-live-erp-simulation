# Go-Live — ERP Investment Simulation

### ▶ Play it: **https://gutierrezk518.github.io/go-live-erp-simulation/**

Open that link on the classroom laptop and press F11 for full screen. Nothing to install.

A single-laptop classroom simulation for MIS 2101, Week 4 (Enterprise Resource Planning).
Eight student groups run an ERP implementation at **Kelso Foodservice Equipment**, a commercial
kitchen equipment manufacturer, across four investment rounds. After Round 4 a readiness
multiplier turns the spending into realized outcomes.

**The chart is a J-curve.** Each group's line drops as they spend, because money leaves on the
day the decision is made. Value only lifts the line back up once the thing they funded is
running, so nothing a group buys pays back in the round they buy it. Every group finishes
Round 4 underwater, and the groups that skimped look best right up until the multiplier lands.
That inversion is the lesson.

Runs fully offline. No backend, no accounts. State autosaves to `localStorage` after every click.

## Run it

The hosted link above is the simplest option and works offline once the page has loaded, since
the app makes no network calls after load. To run it locally instead:

```bash
npm install
npm run dev
```

Open the URL Vite prints (normally http://localhost:5173) and press **F11** for full screen on the projector.

Other commands:

| Command | What it does |
|---|---|
| `npm run balance` | Prints the outcome of the PRD reference paths and sweeps all 256 paths |
| `npm run typecheck` | TypeScript check |
| `npm run build` | Static build into `dist/` (open `dist/index.html` from any static server) |

## Retuning the morning of class

Every number lives in **`src/config/rounds.ts`**: budget, the four rounds' costs / annual value /
readiness, the readiness bands and multipliers, the disruption cost, the overrun premium, the
Revlon benchmark, and all 16 consequence narratives. The case text on the briefing screen lives
in `src/config/scenario.ts`. No component code needs to change.

## Scoring

What the chart plots during rounds 1 to 4, which is why the lines dip:

```
Cash Position(round r) = Σ AnnualValue(i) × (r − i)  −  Spend  −  Overrun Premium
```

A decision made in round `i` contributes nothing in round `i` and accrues from the next round on.

What the chart plots after the multiplier is applied:

```
Realized 5-Year Value = (Total Annual Value × 5) × Multiplier
Net Result            = Realized 5-Year Value − Total Spend − Overrun Premium − Disruption
ROI                   = Net Result ÷ (Total Spend + Overrun Premium)
```

| Total readiness | Multiplier | Extra |
|---|---|---|
| ≥ 10 | 1.5× | |
| 6 to 9 | 1.2× | |
| 2 to 5 | 1.0× | |
| −1 to 1 | 0.7× | |
| ≤ −2 | 0.4× | +$6M disruption cost |

**Going over budget is allowed.** The board funds the overrun, but every $1 above $15M costs
$1.50 (`OVERRUN_PREMIUM = 0.5`). The option cards and the confirm button say so plainly when a
choice would go over. Unspent budget is kept but not multiplied and not counted in Net Result
(`COUNT_UNSPENT_IN_NET` in the config flips that).

Reference paths (`npm run balance`):

| Path | Spend | Readiness | Multiplier | Net | ROI |
|---|---|---|---|---|---|
| Invest well (1B 2B 3B 4C) | $14.8M | 11 | 1.5× | +$26.45M | +179% |
| Middle road (1A 2D 3B 4C) | $11.6M | 3 | 1.0× | +$13.4M | +116% |
| Skimp (1D 2D 3D 4A) | $6.2M | −4 | 0.4× | −$7.2M | −116% |
| Best of everything, over budget (1B 2B 3C 4B) | $16.7M + $0.85M premium | 13 | 1.5× | +$26.7M | +152% |

The inversion, for the debrief. Where each path sits on the chart at the end of Round 4, versus
where it lands once the multiplier is applied:

| Path | After Round 4 | Realized |
|---|---|---|
| Invest well | −$3.5M (looks worst) | +$26.45M |
| Middle road | −$0.8M | +$13.4M |
| Skimp | −$0.7M (looks best) | −$7.2M |

## Instructor run-sheet (≈ 20 minutes)

1. **Setup** — set the group count, optionally name groups, press *Start Session*.
2. **The Case** — read the briefing aloud. It states the company, the four decisions, how
   scoring works, and the over-budget rule. Press *Begin Round 1*. (The Case is reachable from
   every round via the button in the top bar.)
3. **Each round** — a rep clicks their group's tile on the right, clicks an option card,
   presses *Confirm*. Cards show cost only. Click a locked tile to undo a misclick.
   Press *Reveal Round N* whenever you want. It is never blocked: if groups are still deciding,
   the button turns gold and shows the count, and any group without a choice sits that round out
   (no spend, no progress, and it is named on the reveal screen).
4. **Reveal** — consequence narratives on the left, the cash-position chart on the right,
   readiness words (never numbers) below. Press *Next*.
5. **After Round 4** — press *Show Final Results*. Every line is still below break even.
   Ask the room who is winning before you press the next button; the skimpers are on top.
   Press **Apply Readiness Multiplier**: the axis relabels to *Realized* and the lines re-sort
   over 1.5 seconds. Then *Show Revlon 2018 benchmark* drops the −$117M line in.
6. **Results table** and **Debrief** buttons are in the top-right. *Export session JSON* saves
   the whole run.

If the browser is closed or refreshed at any point, reopen the URL: the session restores
automatically, and the Setup screen also offers *Resume previous session*.

## Stack

Vite · React 19 · TypeScript · Tailwind v4 · Recharts 3. Styling follows the Fox School
teaching design system (Temple Cherry `#9D2235`, Roboto Condensed / Roboto with local fallbacks
so nothing loads from the network). The eight group colors were validated for color-vision
deficiency; every line also has its own marker shape and a direct end-label, so no legend is needed.

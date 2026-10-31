# Gatherly picnic vote

A polished, standalone picnic-place voting board for **Dinajpur Polytechnic Institute's CST department**, built for **1st, 2nd, 4th, and 6th semester students** choosing a destination for the **November 10, 2026 picnic**. It includes a live countdown, Swapnopuri-first destination library across Rangpur Division, a bilingual Bangla-English voting pass, semester/shift/roll/phone fields, generated student tokens, animated ticket confirmation, theme switching, local student ledger, Excel-compatible CSV export, responsive liquid-glass UI, search/filter controls, vote toggling, and a suggestion dialog.

## Run it

No install or build step is needed. Open `index.html` directly in any modern browser, or serve this folder with a local static server if preferred.

```text
picnic-vote/
├── index.html
├── styles.css
├── script.js
└── README.md
```

## Notes

- All visuals are CSS shapes and emoji, with no external dependencies, image URLs, or web-font requests, so the page loads quickly.
- The student ledger and Excel export are local to the current browser/device. To collect real votes from every student in one shared list, connect the form to Supabase or Firebase with authentication and shared persistence.
- Vote counts start at zero and change only when a student submits a voting pass or deliberately clicks a Vote button. There are no seeded or simulated votes.

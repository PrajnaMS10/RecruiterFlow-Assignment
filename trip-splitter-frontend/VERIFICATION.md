# Verification handover

Verified on Windows with Node 24.13.0 and npm 11.21.1.

| Check | Observed result |
| --- | --- |
| `npm install` | Completed; package-lock.json generated |
| Final dependency audit during install | 0 vulnerabilities |
| `npm run typecheck` | Passed with strict mode and no errors |
| `npm run lint` | Passed with no errors |
| `npm run build` | Passed using Vite 7.3.7; output in dist/ |
| `npm run test` | Passed: 51 tests across 5 files, Vitest 4.1.12 |
| `npm run dev` | Vite started successfully and served the app |
| Real Chromium checks | Passed: desktop, every split mode, filtering/total, reload persistence, confirmed deletion, unknown route |
| 360px checks | List and form had no page overflow; table scrolls inside its container |
| Screenshot review | Desktop list and mobile validation form visually inspected |

The final Vitest run required execution outside the Codex Windows sandbox because its temporary-cache rename was blocked there. Chromium and its Vite server also needed to run outside the sandbox for browser testing. These are environment restrictions; the normal project scripts remain unchanged.

## Money assertions

The six assignment expenses total ₹42,249.99. Sample balances in paise:

- Aarav: +1855420
- Diya: -369578
- Kabir: +55408
- Meera: -811250
- Rohan: -730000

Their sum is exactly zero. ₹100 equally among m1/m2/m3 produces 3334/3333/3333 paise. The airport cab produces 49995/49995/50009 paise under the documented largest-remainder rule. Tests include the payer outside the split, tiny amounts, the maximum expense, rejected precision, invalid shares and totals, and saved-data recovery.

All required application features are implemented. Limitations: browser-local data, no cross-tab/device synchronization, and hosting must provide an index.html fallback for React Router. Automated browser checks are supplemental local verification, not an additional project dependency; screenshots and the machine-specific smoke script are ignored under .verification/.

No repository, commits, pushes, or GitHub resources were created.

## Enhancement verification

Light/dark themes, member details and expense details were added to the existing app without new dependencies. Shared integer-paise contribution utilities now supply summary balances, member histories and expense totals. The 51-test suite includes the original 37 tests plus 14 enhancement tests.

Chromium checks passed for theme persistence and invalid-preference fallback, all expenses in member details despite category filtering, all five members in expense details, excluded-payer contributions, modal Tab containment, Escape/Close, focus return, saving/reloading and no browser errors. Desktop dark mode, mobile dark member details, mobile light expense details and mobile dark validation were visually reviewed. Both details and the form fit 360px width.

Checksums confirmed that sample data, Redux store, expense persistence, add-expense page, validation and both dependency files remained unchanged. Theme preference uses its own localStorage key. No Git diff was available because this directory is not a Git repository; the modified files were inspected directly and protected files compared against their pre-edit hashes.

### Files changed for enhancements

Updated: `index.html`, `src/App.tsx`, `src/pages/ExpensesPage.tsx`, `src/styles.css`, `src/utils/money.ts`, `src/test/setup.ts`, `README.md`, and this verification report.

Added: `src/utils/theme.ts`, `src/utils/contributions.test.ts`, `src/components/ThemeToggle.tsx`, `src/components/DetailDialog.tsx`, `src/components/FinancialDetails.tsx`, and `src/test/details.test.tsx`.

Local browser scripts, screenshots and baseline hashes live only in the ignored `.verification/` directory.

# Trip Splitter

A React and TypeScript application for managing shared expenses for a Goa trip involving five friends: Aarav, Diya, Kabir, Meera, and Rohan.

## Features

- Add and delete expenses with confirmation.
- Split expenses equally, by exact amounts, or by percentages.
- View each member’s overall balance and expense-by-expense breakdown.
- Open an expense to see every member’s share, payment, and net contribution.
- Filter expenses by category and view the filtered total.
- Validate inputs and display errors beside invalid fields.
- Save expenses and theme preferences in browser localStorage.
- Switch between light and dark mode.
- Use responsive layouts and keyboard-accessible controls.
- Start with the assignment’s five members and six sample expenses.

## Tech Stack

React, strict TypeScript, Vite, React Router, Redux Toolkit, plain CSS, Vitest, React Testing Library, ESLint, and typescript-eslint.

## Setup and Installation

**Prerequisites:** Node.js 22.12 or later and npm.

Clone or download the repository, open the project folder in VS Code, and run:

```powershell
npm install
npm run dev
```

Open the Local URL printed by Vite. Stop the development server with **Ctrl+C**.

## Available Commands

```powershell
npm run build
npm run preview
npm run typecheck
npm run lint
npm run test
```

- `build` creates the production build in `dist/`.
- `preview` serves the production build locally; run `build` first.
- `typecheck` checks strict TypeScript types.
- `lint` checks ESLint rules.
- `test` runs automated tests once and exits.

Production hosting must serve `index.html` for client-side routes.

## Design Decisions

1. **State ownership:** Redux Toolkit manages members and expenses. Form drafts, filters, and detail selection remain local to their components. Theme preference is separate from financial data.
2. **Shared financial logic:** Reusable TypeScript utilities handle parsing, validation, splitting, and contributions. Summary balances and both detail views use the same calculations.
3. **Persistence:** A store subscription saves changes to localStorage, keeping reducers pure and writing only when expenses change. Missing or invalid saved expenses fall back to sample data; a saved empty list stays empty.

## Money and Rounding

Amounts are stored as integer paise: ₹1,250.50 becomes `125050`.

Equal splits allocate leftover paise in ascending member-ID order. Thus ₹100 shared by m1, m2, and m3 becomes ₹33.34, ₹33.33, and ₹33.33.

Percentage calculations use integer basis points. Leftover paise go to the largest fractional remainders, with member ID breaking ties. Exact and percentage totals must match their requirements before saving.

**Net contribution = amount paid − share owed.** Positive means money back; negative means money owed. Contributions do not specify direct repayment relationships. Group balances sum to exactly zero.

## Themes and Storage

Use the navbar’s sun/moon toggle to change themes. The preference is restored before first paint where possible; missing or invalid preferences default to light.

Storage belongs to the same browser and site URL, including its port. Data does not synchronize across browsers, tabs, or devices.

## Testing

Tests cover money calculations, validation, persistence, routing, expense management, themes, financial details, and dialog keyboard behavior.

## Future Improvements

Cloud synchronization, expense export/import, and broader accessibility testing.

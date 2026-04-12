# CoopSim

CoopSim is a cooperative policy simulation dashboard built with Vite, React, TypeScript, and Tailwind CSS. It helps cooperative administrators compare existing policy settings with proposed changes, run impact simulations, and view key metrics in a single authenticated dashboard.

## Key Features

- Authentication flows with login and registration screens
- Dashboard overview with policy, member, and simulation statistics
- Policy simulation page with current vs proposed policy comparison
- Impact charts and summary insights for decision support
- Responsive layout and custom UI components using shadcn-style design

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- React Query
- Recharts
- Radix UI

## Project Structure

- `src/App.tsx` - main router and app shell
- `src/pages/Index.tsx` - landing page
- `src/pages/Login.tsx` - login screen
- `src/pages/Register.tsx` - registration page
- `src/pages/Dashboard.tsx` - main user dashboard
- `src/pages/Simulation.tsx` - policy simulation page
- `src/components/` - reusable UI components and layout
- `src/lib/` - API utilities and helpers
- `src/hooks/` - custom hooks like authentication and toast notifications

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Notes

- Authentication currently relies on the `authApi` implementation in `src/lib/api.ts`.
- The dashboard and simulation pages are designed for cooperative policy and member impact analysis.
- You can extend the simulation logic and API integration with real backend services.

# Klokku UI Developer Guidelines

## Project Overview
Klokku UI is a modern React-based frontend application built with TypeScript and Vite. It uses Radix UI for accessible components, TailwindCSS for styling, and React Query for state management.

## Project Structure
```
├── src/                # Source code
│   ├── api/           # API integration and services
│   ├── assets/        # Static assets (images, fonts)
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and helpers
│   ├── pages/         # Page components and routes
│   └── App.tsx        # Root application component
├── public/            # Static assets
├── dist/              # Build output
├── docker/            # Docker configuration
├── .github/           # GitHub Actions workflows
└── configuration files (tsconfig.json, vite.config.ts, etc.)
```

## Development Setup
1. **Prerequisites**
   - Node.js (LTS version)
   - npm or yarn

2. **Installation**
   ```bash
   npm install
   ```

3. **Available Scripts**
   - `npm run dev` - Start development server
   - `npm run build` - Build for production
   - `npm run lint` - Run ESLint
   - `npm run preview` - Preview production build

## Tech Stack
- **Core**: React 18, TypeScript
- **Build Tool**: Vite
- **UI Components**: Radix UI
- **Styling**: TailwindCSS
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod
- **Routing**: React Router DOM
- **Charts**: Recharts

## Best Practices
1. **Code Organization**
   - Use TypeScript for type safety
   - Follow component-based architecture
   - Keep components small and focused

2. **Styling**
   - Use TailwindCSS utility classes
   - Follow the project's design system
   - Utilize Radix UI for accessible components

3. **State Management**
   - Use React Query for server state
   - Keep local state minimal
   - Implement proper error handling

4. **Performance**
   - Lazy load routes and heavy components
   - Optimize images and assets
   - Use proper React hooks dependencies

## Build & Deployment
1. **Local Build**
   ```bash
   npm run build
   ```

2. **Docker**
   ```bash
   docker pull ghcr.io/klokku/klokku-ui:latest
   docker run -p 3000:80 ghcr.io/klokku/klokku-ui:latest
   ```

3. **CI/CD**
   - GitHub Actions handles automated builds
   - Deployments are triggered on main branch
   - Container images are pushed to GitHub Container Registry

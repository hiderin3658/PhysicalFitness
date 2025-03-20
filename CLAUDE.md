# Physical Fitness Test App Guidelines

## Development Commands
- `npm run dev` - Start development server with turbopack
- `npm run build` - Build production version
- `npm run lint` - Run ESLint for code linting
- `npm run start` - Start production server

## Code Style Guidelines
- **TypeScript**: Use strict type checking. Define interfaces in `app/lib/types.ts`
- **React**: Use functional components with React hooks (`useState`, `useEffect`)
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Imports**: Group imports by source (React, Next.js, components, lib)
- **Error Handling**: Use try/catch in API routes with proper error responses
- **UI Components**: Use Tailwind CSS for styling (bg-blue-50, p-8, etc.)
- **API Structure**: Follow REST conventions for API routes
- **Data Formatting**: Use parseFloat/parseInt for number conversions
- **Form Handling**: Use controlled components with onChange handlers
- **File Structure**: App Router with pages in app/ directory

## Database Access
- Use functions from `app/lib/db.ts` for all data operations
- Upstash Redis is used as the database with key-value storage
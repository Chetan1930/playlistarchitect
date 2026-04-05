# CourseTrack - AI Development Rules & Guidelines

This document outlines the core technologies used in the CourseTrack application and provides strict rules for which libraries to use for specific development tasks. Adhere to these guidelines to maintain a consistent, maintainable, and performant codebase.

## 🚀 Tech Stack

- **Framework:** React 18 (built with Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (built on Radix UI)
- **Backend & Auth:** Supabase (PostgreSQL, Authentication, Edge Functions)
- **Data Fetching & State:** TanStack React Query v5
- **Routing:** React Router DOM v6
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Drag & Drop:** React Beautiful DnD

---

## 📜 Library Usage Rules

When writing or modifying code, adhere strictly to the following library choices for these specific domains:

### 1. UI Components & Styling
- **Rule:** Always prioritize existing `shadcn/ui` components (found in `src/components/ui/`) before building custom components. 
- **Rule:** Use **Tailwind CSS** utility classes for all styling. Avoid custom CSS files or inline styles (`style={{...}}`) unless dealing with highly dynamic values that cannot be handled by Tailwind.
- **Rule:** Use `clsx` and `tailwind-merge` (via the `cn` utility in `src/lib/utils.ts`) when conditionally joining Tailwind classes.

### 2. Icons
- **Rule:** Exclusively use **Lucide React** (`lucide-react`) for all UI icons. Do not introduce other icon libraries (like FontAwesome or Heroicons) or raw SVG strings unless absolutely necessary for custom brand assets.

### 3. Data Fetching & State Management
- **Rule:** Use **TanStack React Query** (`useQuery`, `useMutation`, `useQueryClient`) for managing server state and data fetching. 
- **Rule:** Do **not** use `useEffect` combined with `useState` for standard data fetching.

### 4. Backend Interactions (Database & Auth)
- **Rule:** Use the initialized **Supabase JS client** (`import { supabase } from '@/integrations/supabase/client'`) for all database queries, authentication actions, and edge function invocations.
- **Rule:** Avoid raw `fetch()` calls unless interacting with a third-party API that is not managed by Supabase.
- **Rule:** Use the custom `useAuth` hook (`src/hooks/useAuth.tsx`) to access the current user session and authentication methods.

### 5. Notifications / Toasts
- **Rule:** Use **Sonner** (`import { toast } from 'sonner'`) for all application notifications and toast messages. Do not use standard window alerts or the older Radix toast unless specifically maintaining legacy components.

### 6. Forms & Validation
- **Rule:** For simple forms, controlled inputs (`useState`) are acceptable.
- **Rule:** For complex forms with validation, use **React Hook Form** coupled with **Zod** for schema validation (as demonstrated in `src/pages/Auth.tsx`).

### 7. Routing & Navigation
- **Rule:** Use **React Router DOM** for all navigation. Use the `<Link>` component for declarative routing and the `useNavigate` hook for programmatic navigation. Do not use standard `<a>` tags for internal app routing to prevent full page reloads.

### 8. Drag and Drop
- **Rule:** Use **React Beautiful DnD** (`react-beautiful-dnd`) for list reordering and drag-and-drop interactions (e.g., reordering playlists).
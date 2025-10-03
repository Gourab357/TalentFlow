# TalentFlow - Modern Hiring Platform

A beautiful, feature-rich hiring platform built with React, Redux Toolkit, and MirageJS.

## Features

### 🎯 Jobs Management
- List all jobs with search and filtering
- Create, edit, and archive jobs
- Drag-and-drop reordering
- Deep linking to individual jobs
- Tag-based organization

### 👥 Candidates Pipeline
- Manage 1000+ candidates efficiently
- Kanban board with drag-and-drop stage transitions
- Client-side search by name/email
- Server-side filtering by stage
- Individual candidate profiles with timeline
- Notes with @mentions support

### 📋 Assessments
- Assessment builder framework (ready to extend)
- Multiple question types support
- Live preview capabilities
- Form validation and conditional logic

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Redux Toolkit + Redux Persist
- **Styling**: TailwindCSS + shadcn/ui components
- **Mock API**: MirageJS with realistic latency and error simulation
- **Routing**: React Router v6
- **Drag & Drop**: @hello-pangea/dnd

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:8080](http://localhost:8080)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── MainLayout.tsx  # Sidebar + header shell
│   └── KanbanBoard.tsx # Drag-and-drop board
├── pages/              # Route-level pages
│   ├── JobsPage.tsx
│   ├── CandidatesPage.tsx
│   └── AssessmentsPage.tsx
├── store/              # Redux Toolkit state
│   ├── store.ts        # Store configuration
│   ├── jobsSlice.ts
│   ├── candidatesSlice.ts
│   └── uiSlice.ts
└── server.ts           # MirageJS mock server
```

## Features

### State Persistence
All state is persisted to localStorage via Redux Persist, ensuring data survives page refreshes.

### Mock API
MirageJS simulates a realistic backend with:
- 200-1200ms latency
- 5-10% error rate on write operations
- Pagination and filtering
- 25 seeded jobs and 1000 candidates

### Design System
Modern, professional design with:
- Indigo/purple primary color scheme
- Semantic color tokens for status indicators
- Smooth transitions and animations
- Responsive layouts
- Dark mode ready

## Next Steps

- [ ] Add job creation/edit modal
- [ ] Implement candidate profile pages
- [ ] Build assessment builder UI
- [ ] Add virtualized list view for candidates
- [ ] Implement @mentions functionality
- [ ] Add advanced filtering and sorting
- [ ] Create detailed analytics dashboard

## License

MIT

# L'Avenue Training Site - Updates

## Phase 1: Upgrade to full-stack
- [x] Add web-db-user feature for backend, database, and file storage
- [x] Review upgrade README and apply necessary changes

## Phase 2: Light theme (white background)
- [x] Update index.css color variables for light theme
- [x] Update App.tsx defaultTheme to "light"
- [x] Adjust all component colors for light background (cards, text, borders)
- [x] Ensure gold accents work well on white background
- [x] Fix hero section text contrast on light theme

## Phase 3: Image upload & Login system
- [x] Create database schema for dishes, users, and images
- [x] Implement S3 file upload for JPG images
- [x] Add image upload component in Admin panel
- [x] Implement user authentication (OAuth login)
- [x] Protect Admin routes with auth middleware (adminProcedure)
- [x] Create login gate UI on Admin page
- [x] Migrate dish data from localStorage to database (tRPC + Drizzle)
- [x] Update MenuContext to use tRPC instead of localStorage
- [x] Update all pages (Home, DishDetail, Quiz, Admin) for new Dish type

## Phase 4: Testing & Delivery
- [x] Write vitest tests for backend routes
- [x] Test login flow
- [x] Test image upload
- [x] Test admin CRUD operations
- [x] Verify responsive design with new theme
- [x] Save checkpoint and deliver

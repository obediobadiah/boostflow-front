# BoostFlow Frontend

The frontend web application for BoostFlow - a platform connecting businesses with social media promoters for effective product promotion.

## Features

- **Authentication:** Secure login/signup with JWT and social login (Google OAuth)
- **Dashboard:** Intuitive dashboard for businesses and promoters
- **Product Management:** Create, edit, and manage products for promotion
- **Promotion Campaigns:** Create and track promotion campaigns
- **Social Media Integration:** Connect and manage social media accounts
- **Analytics:** Track promotion performance with detailed analytics
- **Responsive Design:** Fully responsive UI built with TailwindCSS and Radix UI

## Technologies Used

- **Next.js 15** - React framework with server-side rendering
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Redux Toolkit** - State management
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **Axios** - HTTP client
- **Framer Motion** - Animation library
- **JWT** - Authentication with tokens
- **OAuth** - Social authentication

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Backend API server running (see [backend repo](../boostflow-back))

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd boostflow-front
   ```
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

4. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5001/api
   ```

### Running the Application

#### Development mode
```
npm run dev
```
or
```
yarn dev
```

The application will be available at http://localhost:3000

#### Production build
```
npm run build
npm start
```
or
```
yarn build
yarn start
```

## Project Structure

```
boostflow-front/
│
├── src/                     # Source code
│   ├── app/                 # Next.js app router components and pages
│   │   ├── (auth)/          # Authentication-related pages
│   │   ├── (dashboard)/     # Dashboard pages
│   │   └── api/             # API routes
│   │
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions and API services
│   │   └── api/             # API service modules
│   ├── redux/               # Redux state management
│   │   └── slices/          # Redux slices
│   └── hooks/               # Custom React hooks
│
├── public/                  # Static files
├── node_modules/            # Dependencies
├── .env.local               # Environment variables (create this file)
├── package.json             # Project metadata and scripts
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # TailwindCSS configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

## Authentication Flow

The application uses JWT for authentication with the following flow:

1. User logs in via credentials or OAuth (Google)
2. Backend validates credentials and returns a JWT token
3. Frontend stores token in localStorage and cookies
4. Token is included in Authorization header for API requests
5. Protected routes verify authentication status before rendering

## Development Guidelines

- Follow the existing component patterns for consistency
- Use TypeScript types for all components and functions
- Style components using TailwindCSS utility classes
- Use Redux for global state, and local state for component-specific state
- Add appropriate comments for complex logic
- Write test cases for critical functionality

## Deployment

The frontend can be deployed to platforms like Vercel, Netlify, or any hosting provider that supports Next.js applications.

### Deployment to Vercel

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

## License

This project is licensed under the MIT License. 
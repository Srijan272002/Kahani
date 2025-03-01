# Kahani

A modern web application built with React, TypeScript, and Vite.

## 🚀 Features

- ⚡️ Lightning fast development with Vite
- 🎯 TypeScript for type safety
- 💅 Tailwind CSS for styling
- 🔒 Supabase integration for backend services
- 🤖 OpenAI integration
- 📱 Responsive design with Headless UI components
- 🧪 Testing setup with Vitest
- 🎨 Modern UI components with Lucide React
- 🛣️ Client-side routing with React Router
- 🔔 Toast notifications with React Hot Toast

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (LTS version recommended)
- npm or yarn

## 🛠️ Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd kahani
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Fill in the required environment variables in the `.env` file.

## 🚀 Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

To preview the production build:

```bash
npm run preview
# or
yarn preview
```

## 🧪 Testing

Run tests using Vitest:

```bash
npm run test
# or
yarn test
```

## 🔧 Scripts

- `dev`: Start development server
- `build`: Create production build
- `preview`: Preview production build
- `lint`: Run ESLint for code linting

## 📚 Tech Stack

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.io/)
- [OpenAI](https://openai.com/)
- [React Router](https://reactrouter.com/)
- [Headless UI](https://headlessui.dev/)
- [Lucide React](https://lucide.dev/)
- [Vitest](https://vitest.dev/)

## 📝 Environment Variables

The following environment variables are required:

```env
# Copy these to your .env file
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](issues-url).

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

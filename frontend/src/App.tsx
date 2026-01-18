import { ThemeProvider } from '@/components/theme-provider';
import NavBar from './components/layout/NavBar';
import LandingPage from './pages/LandingPage';
import Footer from './components/layout/Footer';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen overflow-hidden">
        <NavBar />
        <LandingPage />
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;

// src/App.tsx
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import "./App.css";
import { ThemeProvider } from './components/theme-provider';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/sonner';
import Router from './router';
import { AuthWrapper } from './components/AuthWrapper';
import { supabase } from './lib/supabase';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (renamed from cacheTime)
    },
  },
});

supabase.auth.onAuthStateChange(() => {
  queryClient.invalidateQueries({ queryKey: ['auth'] })
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <TooltipProvider>
            <AuthWrapper>
              <Router />
            </AuthWrapper>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>      
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

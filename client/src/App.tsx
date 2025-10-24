import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/features/auth/auth-context";
import { ThemeProvider } from "@/layouts/theme-context";
import { MainLayout } from "@/layouts/MainLayout";
import AppRoutes from "@/routes/AppRoutes";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <MainLayout>
            <AppRoutes />
          </MainLayout>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { Header } from "@/components/header";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import PostDetail from "@/pages/post-detail";
import Dashboard from "@/pages/dashboard";
import NewPost from "@/pages/new-post";
import Trending from "@/pages/trending";
import Search from "@/pages/search";
import Teams from "@/pages/teams";
import Players from "@/pages/players";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/post/:slug" component={PostDetail} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/new-post" component={NewPost} />
      <Route path="/trending" component={Trending} />
      <Route path="/search" component={Search} />
      <Route path="/teams" component={Teams} />
      <Route path="/players" component={Players} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <Router />
              </main>
            </div>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

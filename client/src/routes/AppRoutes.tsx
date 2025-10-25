import { Switch, Route } from "wouter";
import Home from "@/pages/home";
import PostDetail from "@/pages/post-detail";
import Trending from "@/pages/trending";
import Search from "@/pages/search";
import NotFound from "@/pages/not-found";
import Login from "@/features/auth/login";
import Register from "@/features/auth/register";
import Dashboard from "@/features/dashboard/dashboard";
import NewPost from "@/features/dashboard/new-post";
import Teams from "@/features/teams/teams";
import Players from "@/features/teams/players";

function AppRoutes() {
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

export default AppRoutes;

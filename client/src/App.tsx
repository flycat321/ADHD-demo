import { Route, Switch, useLocation, useRoute } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useStore } from "./store";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Knowledge from "@/pages/Knowledge";
import Focus from "@/pages/Focus";
import Community from "@/pages/Community";
import Profile from "@/pages/Profile";
import Auth from "@/pages/auth-page";
import Groups from "@/pages/Groups";
import GroupDetail from "@/pages/GroupDetail";
import CreateGroup from "@/pages/CreateGroup";
import StatusBar from "./components/layout/StatusBar";
import BottomNavigation from "./components/layout/BottomNavigation";

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useStore();
  const [isMatched] = useRoute("/auth");
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated && !isMatched) {
      navigate("/auth");
    }
  }, [isAuthenticated, isMatched, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated } = useStore();

  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      <Route path="/">
        {isAuthenticated ? <Home /> : <Auth />}
      </Route>
      <Route path="/knowledge" component={() => <PrivateRoute component={Knowledge} />} />
      <Route path="/focus" component={() => <PrivateRoute component={Focus} />} />
      <Route path="/community" component={() => <PrivateRoute component={Community} />} />
      <Route path="/profile" component={() => <PrivateRoute component={Profile} />} />
      <Route path="/groups" component={() => <PrivateRoute component={Groups} />} />
      <Route path="/groups/create" component={() => <PrivateRoute component={CreateGroup} />} />
      <Route path="/groups/:id">
        {(params) => <PrivateRoute component={() => <GroupDetail />} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const { isAuthenticated } = useStore();
  const showNavigation = isAuthenticated && location !== "/auth";

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-lg overflow-hidden relative">
        {showNavigation && <StatusBar />}
        <div className="flex-1 overflow-y-auto pb-4 relative">
          <div className="animate-fadeIn">
            <Router />
          </div>
        </div>
        {showNavigation && <BottomNavigation currentPath={location} />}
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

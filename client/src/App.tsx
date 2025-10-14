import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Free from "@/pages/free";
import Dream from "@/pages/dream";
import DreamView from "@/pages/dream-view";
import DreamLibrary from "@/pages/dream-library";
import AppPage from "@/pages/app";
import AppV2 from "@/pages/app-v2";
import Admin from "@/pages/admin";
import Dreamboard from "@/pages/dashboard";
import CreatePackage from "@/pages/packages/create";
import EditPackage from "@/pages/packages/edit";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/free" component={Free} />
      <Route path="/dream" component={Dream} />
      <Route path="/dream/:id/view" component={DreamView} />
      <Route path="/dreams" component={DreamLibrary} />
      <Route path="/app" component={AppPage} />
      <Route path="/app-v2" component={AppV2} />
      <Route path="/dashboard" component={Dreamboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/packages/create" component={CreatePackage} />
      <Route path="/packages/:id/edit" component={EditPackage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

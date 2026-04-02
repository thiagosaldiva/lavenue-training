import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import DishDetail from "./pages/DishDetail";
import Quiz from "./pages/Quiz";
import { MenuProvider } from "./contexts/MenuContext";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/prato/:id" component={DishDetail} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <MenuProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </MenuProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

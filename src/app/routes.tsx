import { createBrowserRouter, Navigate } from "react-router";
import { Root } from "./Root";
import { Landing } from "./pages/Landing";
import { Events } from "./pages/Events";
import { EventDetails } from "./pages/EventDetails";
import { About } from "./pages/About";
import { Venues } from "./pages/Venues";
import { Contact } from "./pages/Contact";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import { NotFound } from "./pages/NotFound";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";

import { useAuth } from "./components/AuthProvider";
import PaymentResult from "./pages/PaymentResult";

// A simple protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  
  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-background text-foreground">Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "events", Component: Events },
      { path: "event/:id", Component: EventDetails },
      { path: "about", Component: About },
      // { path: "venues", Component: Venues },
      { path: "contact", Component: Contact },
      { path: "privacy", Component: Privacy },
      { path: "terms", Component: Terms },
      { path: "login", Component: Login },
      { path:"payment/result" ,Component:PaymentResult},

      {
        path: "profile",
        Component: () => (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      { path: "*", Component: NotFound },
    ],
  },

]);
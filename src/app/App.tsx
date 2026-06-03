import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./components/AuthProvider";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Toaster } from 'sonner';
export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Toaster />
        <RouterProvider router={router} />
      </AuthProvider>
    </LanguageProvider>
  );
}
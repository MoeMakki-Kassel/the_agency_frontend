import { Outlet } from "react-router";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { PageViewTracker } from "./components/PageViewTracker";

export function Root() {
  return (
    <div className="min-h-screen bg-white text-ink-black flex flex-col font-sans">
      <PageViewTracker />
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
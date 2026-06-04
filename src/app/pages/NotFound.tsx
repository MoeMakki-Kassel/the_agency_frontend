import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-display font-bold text-foreground mb-4">404</h1>
      <h2 className="mb-6">Page Not Found</h2>
      <p className="text-mid-gray max-w-md mb-8 text-lg">
        We couldn't find the page you were looking for. It might have been moved or doesn't exist.
      </p>
      <Link 
        to="/" 
        className="px-8 py-3 rounded-full bg-black text-white font-medium hover:bg-[#b35e38] transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
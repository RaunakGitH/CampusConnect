import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      <div className="orb orb-purple w-[300px] h-[300px] -left-20 top-20" />
      <div className="orb orb-blue w-[200px] h-[200px] -right-10 -bottom-10" />
      <div className="text-center relative z-10">
        <h1 className="mb-2 text-7xl font-bold font-display text-gradient">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="inline-block rounded-xl btn-glow px-6 py-2.5 text-sm font-semibold text-primary-foreground">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

import React from "react";
import { Link } from "react-router-dom";

const ErrorPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex max-w-[500px] flex-col items-center justify-center text-center">
        <h1 className="text-9xl font-extrabold tracking-tighter text-primary">
          404
        </h1>
        <h2 className="mt-4 text-3xl font-bold tracking-tight">
          Page not found
        </h2>
        <p className="mt-4 text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. The page might
          have been removed or the URL might be incorrect.
        </p>
        <button className="mt-4">
          <Link to="/">Back to Home</Link>
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;

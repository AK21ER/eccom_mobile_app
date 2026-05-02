import { SignIn, useAuth, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router";

function LoginPage() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  if (isSignedIn) {
    const email = user?.primaryEmailAddress?.emailAddress;

    if (email === import.meta.env.ADMIN_EMAIL) {
      return <Navigate to="/dashboard" replace />;
    }

    // if signed in but not admin
    return <Navigate to="/" replace />;
  }

  return (
    <div className="h-screen hero">
      <SignIn />
    </div>
  );
}

export default LoginPage;
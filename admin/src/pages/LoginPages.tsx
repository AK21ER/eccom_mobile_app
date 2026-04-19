import { SignIn, useAuth, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router";

function LoginPage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  return (
    <div className="h-screen hero">
      <SignIn />
      {/* if user is admin redirect to dashboard */}
      {isSignedIn && user?.primaryEmailAddress?.emailAddress === import.meta.env.ADMIN_EMAIL ? <Navigate to={"/dashboard"} /> : <Navigate to ={"/"}/>}
    </div>
  );
}
export default LoginPage;
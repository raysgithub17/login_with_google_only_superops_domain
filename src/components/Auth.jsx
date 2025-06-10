import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase, isSuperopsEmail } from "../lib/supabase";
import { useState, useEffect } from "react";

export default function AuthComponent() {
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check current user on component mount
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && !isSuperopsEmail(user.email)) {
          setError(
            "❌ Only @superops.com email addresses are allowed. Please use your Superops email to sign in."
          );
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error("Error checking user:", error);
        setError("Authentication error occurred");
      }
    };
    checkUser();
  }, []);

  const handleAuthStateChange = async (event, session) => {
    try {
      if (event === "SIGNED_IN") {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!isSuperopsEmail(user.email)) {
          setError(
            "❌ Only @superops.com email addresses are allowed. Please use your Superops email to sign in."
          );
          await supabase.auth.signOut();
          return;
        }
      } else if (event === "SIGNED_OUT") {
        setError(null); // Clear error on sign out
      }
    } catch (error) {
      console.error("Error in auth state change:", error);
      setError("Authentication error occurred");
    }
  };

  return (
    <div className="auth-container">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={["google"]}
        redirectTo={window.location.origin}
        onlyThirdPartyProviders={true}
        view="sign_in"
        showLinks={false}
        theme="dark"
        onAuthStateChange={handleAuthStateChange}
      />
      {error && (
        <div
          className="domain-notice error-message"
          style={{ marginTop: "1.5rem" }}
        >
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

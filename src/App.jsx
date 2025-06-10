import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import AuthComponent from "./components/Auth";
import Dashboard from "./components/Dashboard";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Check if user has superops.com email
        if (!session.user.email.endsWith("@superops.com")) {
          await supabase.auth.signOut();
          setSession(null);
        } else {
          setSession(session);
        }
      } else {
        setSession(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      {!session ? (
        <div>
          <h1>Welcome to Superops Auth</h1>
          <AuthComponent />
        </div>
      ) : (
        <Dashboard />
      )}
    </div>
  );
}

export default App;

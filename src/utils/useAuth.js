// A simple hook for authentication actions
export const useAuth = () => {
  const signIn = async (provider) => {
    // Normally you would redirect to the API route here
    // For the demo, we simulate a redirect to the dashboard
    window.location.href = "/dashboard";
  };

  const signOut = async () => {
    // Simulate logout
    window.location.href = "/";
  };

  const signUp = async (email, password) => {
    // Simulate signup
    window.location.href = "/dashboard";
  };

  return { signIn, signOut, signUp };
};

export default useAuth;
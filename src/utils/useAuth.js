// Un hook simplu pentru acțiunile de autentificare
export const useAuth = () => {
  const signIn = async (provider) => {
    // În mod normal aici ai redirecționa către ruta de API
    // Pentru demo, simulăm un redirect către dashboard
    window.location.href = "/dashboard";
  };

  const signOut = async () => {
    // Simulăm logout-ul
    window.location.href = "/";
  };

  const signUp = async (email, password) => {
    // Simulăm înregistrarea
    window.location.href = "/dashboard";
  };

  return { signIn, signOut, signUp };
};

export default useAuth;
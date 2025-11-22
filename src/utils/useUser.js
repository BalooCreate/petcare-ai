import { useRouteLoaderData, useRevalidator } from "react-router";

const useUser = () => {
  const rootData = useRouteLoaderData("root");
  const revalidator = useRevalidator();

  // --- MODIFICARE PENTRU TESTARE ---
  // Simulăm un utilizator conectat ca să poți vedea Dashboard-ul
  const mockUser = {
    id: "user_123",
    name: "Alex PetOwner",
    email: "alex@example.com",
    image: null
  };

  // În mod normal aici ar fi: const user = rootData?.user;
  // Dar pentru test, folosim mockUser:
  const user = mockUser; 

  return { 
    user, 
    data: user, 
    loading: false, 
    isAuthenticated: !!user,
    refetch: revalidator.revalidate 
  };
};

export { useUser };
export default useUser;
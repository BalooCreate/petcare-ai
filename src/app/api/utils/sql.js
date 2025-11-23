import { Form, redirect, useNavigation, useActionData } from "react-router";
import sql from "../../api/utils/sql";

// --- BACKEND: Aici se întâmplă salvarea în baza de date ---
export async function action({ request }) {
  const formData = await request.formData();
  
  // Colectăm datele din formular
  const name = formData.get("name");
  const species = formData.get("species");
  const breed = formData.get("breed");
  const weight = formData.get("weight");
  const birth_date = formData.get("birth_date");
  const details = formData.get("details");

  // Validare simplă
  if (!name || !species) {
    return { error: "Numele și specia sunt obligatorii!" };
  }

  try {
    // ⚠️ IMPORTANT: Momentan folosim un ID fix ('demo_user') pentru test.
    // După ce integrăm Login-ul complet, vom pune aici ID-ul real al utilizatorului.
    const owner_id = "demo_user"; 

    // Executăm comanda SQL în Neon
    await sql`
      INSERT INTO pets (owner_id, name, species, breed, weight, birth_date, details)
      VALUES (${owner_id}, ${name}, ${species}, ${breed}, ${weight}, ${birth_date}, ${details})
    `;

    // Dacă reușește, ne redirecționează către Dashboard (sau lista de animale)
    return redirect("/"); 
  } catch (err) {
    console.error("Eroare la salvare:", err);
    return { error: "A apărut o eroare la salvarea în baza de date." };
  }
}

// --- FRONTEND: Aici este formularul vizual ---
export default function AddPetPage() {
  const navigation = useNavigation();
  const actionData = useActionData();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Adaugă un nou prieten 🐾</h1>
      
      {actionData?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {actionData.error}
        </div>
      )}

      <Form method="post" className="bg-white shadow-md rounded-lg p-6 space-y-4">
        
        {/* Nume */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Numele Animalului</label>
          <input 
            type="text" 
            name="name" 
            placeholder="ex: Rex, Luna"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            required
          />
        </div>

        {/* Specie și Rasă */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Specia</label>
            <select 
              name="species" 
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
            >
              <option value="caine">Câine 🐶</option>
              <option value="pisica">Pisică 🐱</option>
              <option value="pasare">Pasăre 🦜</option>
              <option value="altul">Altul</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rasa (Opțional)</label>
            <input 
              type="text" 
              name="breed" 
              placeholder="ex: Labrador"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
            />
          </div>
        </div>

        {/* Greutate și Data Nașterii */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Greutate (kg)</label>
            <input 
              type="number" 
              step="0.1" 
              name="weight" 
              placeholder="ex: 12.5"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data Nașterii</label>
            <input 
              type="date" 
              name="birth_date" 
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
            />
          </div>
        </div>

        {/* Detalii */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Alte detalii medicale/preferințe</label>
          <textarea 
            name="details" 
            rows="3"
            placeholder="Are alergii? Îi place mingea?"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
          ></textarea>
        </div>

        {/* Buton Submit */}
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? "Se salvează..." : "Salvează Animalul"}
          </button>
        </div>

      </Form>
    </div>
  );
}
import { Form, useLoaderData, redirect, Link } from "react-router";
import sql from "../../api/utils/sql"; // Verifică dacă calea e corectă!

// 1. Încărcăm datele existente ca să le punem în formular
export async function loader({ params }) {
  const result = await sql`SELECT * FROM pets WHERE id = ${params.id}`;
  if (!result.length) throw new Response("Not Found", { status: 404 });
  return { pet: result[0] };
}

// 2. Salvăm modificările (UPDATE)
export async function action({ request, params }) {
  const formData = await request.formData();
  
  const name = formData.get("name");
  const species = formData.get("species");
  const breed = formData.get("breed");
  const weight = formData.get("weight");
  const image_url = formData.get("image_url");
  const details = formData.get("details");

  await sql`
    UPDATE pets 
    SET 
      name = ${name},
      species = ${species},
      breed = ${breed},
      weight = ${weight},
      image_url = ${image_url},
      details = ${details}
    WHERE id = ${params.id}
  `;

  return redirect(`/pets/${params.id}`);
}

// 3. Formularul de editare
export default function EditPetPage() {
  const { pet } = useLoaderData();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Editează Profilul: {pet.name}</h1>
        
        <Form method="post" className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Nume</label>
            <input name="name" defaultValue={pet.name} className="w-full p-2 border rounded-lg" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Specie</label>
                <select name="species" defaultValue={pet.species} className="w-full p-2 border rounded-lg">
                    <option value="Câine">Câine</option>
                    <option value="Pisică">Pisică</option>
                    <option value="Altul">Altul</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Rasă</label>
                <input name="breed" defaultValue={pet.breed} className="w-full p-2 border rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Greutate (kg)</label>
            <input name="weight" type="number" step="0.1" defaultValue={pet.weight} className="w-full p-2 border rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Imagine URL</label>
            <input name="image_url" defaultValue={pet.image_url} className="w-full p-2 border rounded-lg" placeholder="https://..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Note Medicale / Detalii</label>
            <textarea name="details" defaultValue={pet.details} className="w-full p-2 border rounded-lg h-24" />
          </div>

          <div className="flex gap-4 mt-6">
            <Link to={`/pets/${pet.id}`} className="flex-1 py-3 text-center text-gray-600 font-bold bg-gray-100 rounded-xl hover:bg-gray-200">
              Anulează
            </Link>
            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg">
              Salvează
            </button>
          </div>

        </Form>
      </div>
    </div>
  );
}
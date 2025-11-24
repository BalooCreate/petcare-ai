// src/app/pets/[id]/edit/page.jsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function EditPetPage({ params }) {
  const session = await auth();
  if (!session) redirect("/login");

  const pet = await prisma.pet.findUnique({
    where: { id: params.id },
  });

  // Verificăm dacă animalul există și aparține utilizatorului
  if (!pet || pet.userId !== session.user.id) {
    redirect("/dashboard");
  }

  // Funcția care rulează când salvăm modificările
  async function updatePet(formData) {
    "use server";

    const name = formData.get("name");
    const species = formData.get("species");
    const breed = formData.get("breed");
    const age = parseInt(formData.get("age"));
    const weight = parseFloat(formData.get("weight"));
    const imageUrl = formData.get("imageUrl") || null;

    await prisma.pet.update({
      where: { id: pet.id },
      data: {
        name,
        species,
        breed,
        age,
        weight,
        imageUrl,
      },
    });

    redirect(`/pets/${pet.id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        {/* Header */}
        <div className="p-4 flex items-center gap-4 border-b sticky top-0 bg-white z-10">
          <Link href={`/pets/${pet.id}`} className="text-2xl">
            ←
          </Link>
          <h1 className="font-bold text-lg">Editează Profilul</h1>
        </div>

        <div className="p-6">
          <form action={updatePet} className="space-y-6">
            
            {/* Nume */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numele Animalului</label>
              <input 
                type="text" 
                name="name" 
                defaultValue={pet.name}
                required 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Specie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specie</label>
              <select 
                name="species" 
                defaultValue={pet.species}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Câine">Câine</option>
                <option value="Pisică">Pisică</option>
                <option value="Altul">Altul</option>
              </select>
            </div>

            {/* Rasa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rasă (Opțional)</label>
              <input 
                type="text" 
                name="breed" 
                defaultValue={pet.breed || ""}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Vârsta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vârstă (ani)</label>
                <input 
                  type="number" 
                  name="age" 
                  defaultValue={pet.age}
                  required 
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              
              {/* Greutate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Greutate (kg)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  name="weight" 
                  defaultValue={pet.weight}
                  required 
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Imagine URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Imagine (URL)</label>
              <input 
                type="url" 
                name="imageUrl" 
                defaultValue={pet.imageUrl || ""}
                placeholder="https://..."
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Lasă gol pentru a păstra imaginea actuală (dacă nu o schimbi).</p>
            </div>

            {/* Buton Salvare */}
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition transform active:scale-95"
            >
              Salvează Modificările
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
import { Form, redirect, useNavigation, useActionData } from "react-router";
import sql from "../../api/utils/sql";

export async function action({ request }) {
  const formData = await request.formData();
  
  const name = formData.get("name");
  const species = formData.get("species");
  const breed = formData.get("breed");
  const weight = formData.get("weight");
  const birth_date = formData.get("birth_date");
  const details = formData.get("details");

  if (!name || !species) {
    return { error: "Name and Species are required!" };
  }

  try {
    // Temporary User ID (we will change this later when we add Login)
    const owner_id = "demo_user"; 

    await sql`
      INSERT INTO pets (owner_id, name, species, breed, weight, birth_date, details)
      VALUES (${owner_id}, ${name}, ${species}, ${breed}, ${weight}, ${birth_date}, ${details})
    `;

    return redirect("/"); 
  } catch (err) {
    console.error("Save Error:", err);
    return { error: "Database Error: " + err.message };
  }
}

export default function AddPetPage() {
  const navigation = useNavigation();
  const actionData = useActionData();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Add New Pet 🐾</h1>
      
      {actionData?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {actionData.error}
        </div>
      )}

      <Form method="post" className="bg-white shadow-md rounded-lg p-6 space-y-4 border border-gray-200">
        
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Pet Name</label>
          <input 
            type="text" 
            name="name" 
            className="mt-1 block w-full border border-gray-300 p-2 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            required 
            placeholder="e.g. Rex, Luna" 
          />
        </div>

        {/* Species & Breed */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Species</label>
            <select name="species" className="mt-1 block w-full border border-gray-300 p-2 rounded shadow-sm">
              <option value="dog">Dog 🐶</option>
              <option value="cat">Cat 🐱</option>
              <option value="bird">Bird 🦜</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Breed (Optional)</label>
            <input 
              type="text" 
              name="breed" 
              className="mt-1 block w-full border border-gray-300 p-2 rounded shadow-sm" 
              placeholder="e.g. Labrador"
            />
          </div>
        </div>

        {/* Weight & Birth Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input 
              type="number" 
              step="0.1" 
              name="weight" 
              className="mt-1 block w-full border border-gray-300 p-2 rounded shadow-sm" 
              placeholder="e.g. 12.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Birth Date</label>
            <input 
              type="date" 
              name="birth_date" 
              className="mt-1 block w-full border border-gray-300 p-2 rounded shadow-sm" 
            />
          </div>
        </div>

        {/* Details */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Medical Notes / Details</label>
            <textarea 
              name="details" 
              rows="3"
              className="mt-1 block w-full border border-gray-300 p-2 rounded shadow-sm"
              placeholder="Any allergies or specific needs?"
            ></textarea>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 font-semibold shadow"
        >
          {isSubmitting ? "Saving..." : "Save Pet"}
        </button>

      </Form>
    </div>
  );
}
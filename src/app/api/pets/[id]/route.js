import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get a specific pet
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const petId = params.id;

    const result = await sql`
      SELECT id, name, breed, age, weight, photo_url, medical_notes, created_at, updated_at
      FROM pets 
      WHERE id = ${petId} AND user_id = ${userId}
    `;

    if (result.length === 0) {
      return Response.json({ error: "Pet not found" }, { status: 404 });
    }

    const pet = result[0];
    return Response.json({ pet });
  } catch (error) {
    console.error("GET /api/pets/[id] error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update a specific pet
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const petId = params.id;
    const body = await request.json();
    const { name, breed, age, weight, photo_url, medical_notes } = body;

    // Check if pet exists and belongs to user
    const existingPet = await sql`
      SELECT id FROM pets WHERE id = ${petId} AND user_id = ${userId}
    `;

    if (existingPet.length === 0) {
      return Response.json({ error: "Pet not found" }, { status: 404 });
    }

    // Build dynamic update query
    const setClauses = [];
    const values = [];

    if (name !== undefined && name.trim().length > 0) {
      setClauses.push(`name = $${values.length + 1}`);
      values.push(name.trim());
    }

    if (breed !== undefined) {
      setClauses.push(`breed = $${values.length + 1}`);
      values.push(breed || null);
    }

    if (age !== undefined) {
      setClauses.push(`age = $${values.length + 1}`);
      values.push(age || null);
    }

    if (weight !== undefined) {
      setClauses.push(`weight = $${values.length + 1}`);
      values.push(weight || null);
    }

    if (photo_url !== undefined) {
      setClauses.push(`photo_url = $${values.length + 1}`);
      values.push(photo_url || null);
    }

    if (medical_notes !== undefined) {
      setClauses.push(`medical_notes = $${values.length + 1}`);
      values.push(medical_notes || null);
    }

    if (setClauses.length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    setClauses.push(`updated_at = NOW()`);

    const updateQuery = `
      UPDATE pets 
      SET ${setClauses.join(", ")} 
      WHERE id = $${values.length + 1} AND user_id = $${values.length + 2}
      RETURNING id, name, breed, age, weight, photo_url, medical_notes, created_at, updated_at
    `;

    const result = await sql(updateQuery, [...values, petId, userId]);
    const pet = result[0];

    return Response.json({ pet });
  } catch (error) {
    console.error("PUT /api/pets/[id] error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Delete a specific pet
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const petId = params.id;

    const result = await sql`
      DELETE FROM pets 
      WHERE id = ${petId} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: "Pet not found" }, { status: 404 });
    }

    return Response.json({ message: "Pet deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/pets/[id] error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

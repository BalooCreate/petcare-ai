import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get all pets for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const pets = await sql`
      SELECT id, name, breed, age, weight, photo_url, medical_notes, created_at, updated_at
      FROM pets 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return Response.json({ pets });
  } catch (error) {
    console.error("GET /api/pets error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create a new pet
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { name, breed, age, weight, photo_url, medical_notes } = body;

    if (!name || name.trim().length === 0) {
      return Response.json({ error: "Pet name is required" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO pets (user_id, name, breed, age, weight, photo_url, medical_notes)
      VALUES (${userId}, ${name.trim()}, ${breed || null}, ${age || null}, ${weight || null}, ${photo_url || null}, ${medical_notes || null})
      RETURNING id, name, breed, age, weight, photo_url, medical_notes, created_at, updated_at
    `;

    const pet = result[0];
    return Response.json({ pet }, { status: 201 });
  } catch (error) {
    console.error("POST /api/pets error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

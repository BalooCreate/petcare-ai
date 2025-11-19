import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get all health logs for the current user
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const url = new URL(request.url);
    const petId = url.searchParams.get("pet_id");

    let query = `
      SELECT hl.*, p.name as pet_name
      FROM health_logs hl
      JOIN pets p ON hl.pet_id = p.id
      WHERE hl.user_id = $1
    `;
    const params = [userId];

    if (petId) {
      query += ` AND hl.pet_id = $2`;
      params.push(petId);
    }

    query += ` ORDER BY hl.date_logged DESC, hl.created_at DESC`;

    const logs = await sql(query, params);

    return Response.json({ logs });
  } catch (error) {
    console.error("GET /api/health-logs error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create a new health log
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { pet_id, log_type, title, description, date_logged, photo_url } =
      body;

    if (!pet_id || !log_type || !title) {
      return Response.json(
        {
          error: "Pet ID, log type, and title are required",
        },
        { status: 400 },
      );
    }

    // Verify pet belongs to user
    const petCheck = await sql`
      SELECT id FROM pets WHERE id = ${pet_id} AND user_id = ${userId}
    `;

    if (petCheck.length === 0) {
      return Response.json({ error: "Pet not found" }, { status: 404 });
    }

    const result = await sql`
      INSERT INTO health_logs (
        pet_id, user_id, log_type, title, description, date_logged, photo_url
      )
      VALUES (
        ${pet_id}, ${userId}, ${log_type}, ${title.trim()}, 
        ${description || null}, ${date_logged || new Date().toISOString()}, 
        ${photo_url || null}
      )
      RETURNING *
    `;

    const log = result[0];
    return Response.json({ log }, { status: 201 });
  } catch (error) {
    console.error("POST /api/health-logs error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

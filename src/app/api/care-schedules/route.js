import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get all care schedules for the current user
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
      SELECT cs.*, p.name as pet_name
      FROM care_schedules cs
      JOIN pets p ON cs.pet_id = p.id
      WHERE cs.user_id = $1
    `;
    const params = [userId];

    if (petId) {
      query += ` AND cs.pet_id = $2`;
      params.push(petId);
    }

    query += ` ORDER BY cs.next_due ASC NULLS LAST, cs.created_at DESC`;

    const schedules = await sql(query, params);

    return Response.json({ schedules });
  } catch (error) {
    console.error("GET /api/care-schedules error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create a new care schedule
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const {
      pet_id,
      title,
      description,
      schedule_type,
      frequency,
      time_of_day,
      days_of_week,
      next_due,
    } = body;

    if (!pet_id || !title || !schedule_type || !frequency) {
      return Response.json(
        {
          error: "Pet ID, title, schedule type, and frequency are required",
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
      INSERT INTO care_schedules (
        pet_id, user_id, title, description, schedule_type, frequency, 
        time_of_day, days_of_week, next_due
      )
      VALUES (
        ${pet_id}, ${userId}, ${title.trim()}, ${description || null}, 
        ${schedule_type}, ${frequency}, ${time_of_day || null}, 
        ${days_of_week || null}, ${next_due || null}
      )
      RETURNING *
    `;

    const schedule = result[0];
    return Response.json({ schedule }, { status: 201 });
  } catch (error) {
    console.error("POST /api/care-schedules error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

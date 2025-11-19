import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get chat conversations for the current user
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const url = new URL(request.url);
    const conversationId = url.searchParams.get("conversation_id");

    if (conversationId) {
      // Get messages for a specific conversation
      const messages = await sql`
        SELECT cm.*, cc.title as conversation_title
        FROM chat_messages cm
        JOIN chat_conversations cc ON cm.conversation_id = cc.id
        WHERE cm.conversation_id = ${conversationId} AND cc.user_id = ${userId}
        ORDER BY cm.created_at ASC
      `;

      return Response.json({ messages });
    } else {
      // Get all conversations for the user
      const conversations = await sql`
        SELECT cc.*, p.name as pet_name,
               (SELECT content FROM chat_messages WHERE conversation_id = cc.id ORDER BY created_at DESC LIMIT 1) as last_message,
               (SELECT created_at FROM chat_messages WHERE conversation_id = cc.id ORDER BY created_at DESC LIMIT 1) as last_message_at
        FROM chat_conversations cc
        LEFT JOIN pets p ON cc.pet_id = p.id
        WHERE cc.user_id = ${userId}
        ORDER BY cc.updated_at DESC
      `;

      return Response.json({ conversations });
    }
  } catch (error) {
    console.error("GET /api/chat error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create a new chat conversation or add message to existing one
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { conversation_id, pet_id, title, message, role = "user" } = body;

    if (!message || message.trim().length === 0) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    let conversationIdToUse = conversation_id;

    // If no conversation_id provided, create a new conversation
    if (!conversationIdToUse) {
      const conversationResult = await sql`
        INSERT INTO chat_conversations (user_id, pet_id, title)
        VALUES (${userId}, ${pet_id || null}, ${title || "New Chat"})
        RETURNING id
      `;
      conversationIdToUse = conversationResult[0].id;
    } else {
      // Verify conversation belongs to user
      const conversationCheck = await sql`
        SELECT id FROM chat_conversations WHERE id = ${conversationIdToUse} AND user_id = ${userId}
      `;

      if (conversationCheck.length === 0) {
        return Response.json(
          { error: "Conversation not found" },
          { status: 404 },
        );
      }
    }

    // Add the message
    const messageResult = await sql`
      INSERT INTO chat_messages (conversation_id, role, content)
      VALUES (${conversationIdToUse}, ${role}, ${message.trim()})
      RETURNING *
    `;

    // Update conversation timestamp
    await sql`
      UPDATE chat_conversations 
      SET updated_at = NOW() 
      WHERE id = ${conversationIdToUse}
    `;

    const chatMessage = messageResult[0];
    return Response.json(
      {
        message: chatMessage,
        conversation_id: conversationIdToUse,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/chat error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

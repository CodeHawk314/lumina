import { NextResponse } from "next/server";
import Together from "together-ai";
import { v4 as uuidv4 } from "uuid";

// Temporary storage for sessions (consider using a database in production)
const sessions: { [key: string]: object } = {};

export async function POST(req: Request) {
  try {
    const { outline } = await req.json();
    const sessionId = uuidv4();

    // Store outline with session ID
    sessions[sessionId] = outline;

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId || !sessions[sessionId]) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  const outline = sessions[sessionId];
  console.log(outline);

  if (!outline) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const together = new Together();
  const responseStream = new ReadableStream({
    async start(controller) {
      try {
        const stream = await together.chat.completions.create({
          model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a college admissions consultant helping a student do personal \
                reflection to ultimately help them brainstorm for their college application essays.",
            },
            {
              role: "user",
              content: `Here is the student's outline for brainstorming: ${JSON.stringify(
                outline
              )}`,
            },
            {
              role: "user",
              content: `Give a specific follow up question`,
            },
          ],
          stream: true,
        });

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta.content || "";
          const formattedText = text.replace(/\n/g, "\\n");
          controller.enqueue(`data: ${formattedText}\n\n`);
        }

        controller.close();
      } catch (error) {
        console.error("Streaming error:", error);
        controller.error(error);
      }
    },
  });

  return new NextResponse(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

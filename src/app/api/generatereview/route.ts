import { Bullet } from "@/app/components/luminaEditor/outlineparse";
import { NextResponse } from "next/server";
import Together from "together-ai";
import { v4 as uuidv4 } from "uuid";

// Temporary storage for sessions (consider using a database in production)
const sessions: { [key: string]: { outline: Bullet[] } } = {};

export async function POST(req: Request) {
  try {
    const { outline } = await req.json();
    const sessionId = uuidv4();

    // Store outline with session ID
    sessions[sessionId] = { outline };

    console.log("got session");
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
  const outline = sessions[sessionId].outline;

  if (!outline) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // const admissionsOfficerMessages = [
  //   {
  //     role: "system",
  //     content: `You are a college admissions officer and are providing assistance to a student (the user) to generate a list of potential essay topics the student can use for their college application essays based on a brainstorming activity in which the student has been asked follow-up questions tailored to their responses to the brainstorming questions. Please provide your response in markdown format.`,
  //   },
  //   {
  //     role: "user",
  //     content: `Here are my responses to the college application essay brainstorming activity: ${context}. What are some topics I should write about for my essays?`,
  //   },
  // ];

  const together = new Together();
  const responseStream = new ReadableStream({
    async start(controller) {
      try {
        const stream = await together.chat.completions.create({
          model: "meta-llama/Llama-3-70b-chat-hf",
          messages: [
            {
              role: "system",
              content: `You are a college admissions consultant and are working with a student (the user) to generate a list of potential essay topics the student can use for their college application essays based on a brainstorming activity in which the student has been asked follow-up questions tailored to their responses to the brainstorming questions. Based on their brainstorming outline, give feedback on the most compelling aspects of their character, experiences, and insight, and suggest potential story arcs they could use for a college application essay. Provide your response in markdown format.`,
            },
            {
              role: "user",
              content: `Here are my responses to the college application essay brainstorming activity: ${JSON.stringify(
                outline
              )}. What are some topics I should write about for my essays?`,
            },
          ],
          stream: true,
        });

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta.content || "";
          const formattedText = text.replace(/\n/g, "\\n");
          controller.enqueue(`data: "${formattedText}"\n\n`);
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

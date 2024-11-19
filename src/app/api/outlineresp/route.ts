import { Bullet } from "@/app/components/luminaEditor/outlineparse";
import { NextResponse } from "next/server";
import Together from "together-ai";
import { v4 as uuidv4 } from "uuid";

// Temporary storage for sessions (consider using a database in production)
const sessions: { [key: string]: Bullet[] } = {};

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

function getBulletNumber(text: string): number | null {
  // Use a regular expression to find all bullet numbers in the text
  const matches = text.match(/(\d+)\./g);

  // If matches are found, extract the last number
  if (matches && matches.length > 0) {
    const lastMatch = matches[matches.length - 1];
    const number = lastMatch.match(/^(\d+)/);
    return number ? parseInt(number[1], 10) : null;
  }

  // Return null if no valid bullet number is found
  return null;
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

  const question = outline[0].text;
  const studentResponse = outline[0].subbullets?.[0].text || "";

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
              role: "system",
              content:
                `Based on the student response: "${studentResponse}", suggest 2-3 deeper follow-up questions ` +
                `for the question "${question}"` +
                `to explore the topic further for a college application essay. Format the output as follows:\n\n` +
                `1. [follow up question 1]\n` +
                `2. [follow up question 2]\n` +
                `3. [follow up question 3]\n\n` +
                `Output ONLY the follow-up questions:`,
            },
          ],
          stream: true,
        });

        let fullResponse = "";

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta.content || "";
          const formattedText = text.replace(/\n/g, "\\n");
          fullResponse += formattedText;
          const bulletNum = getBulletNumber(fullResponse);
          console.log(text);
          const strippedText = text; // text.replace(/\n\d+\./g, "");
          if (
            strippedText.length == 0 ||
            strippedText === "." ||
            /^\d$/.test(strippedText)
          ) {
            continue;
          }
          const data = {
            question,
            text: strippedText,
            responseNum: bulletNum,
          };
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
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

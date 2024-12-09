import { Bullet } from "@/app/components/luminaEditor/outlineparse";
import { NextResponse } from "next/server";
import Together from "together-ai";
import { v4 as uuidv4 } from "uuid";

// Temporary storage for sessions (consider using a database in production)
const sessions: { [key: string]: { outline: Bullet[]; currentLine: string } } =
  {};

export async function POST(req: Request) {
  try {
    const { outline, currentLine } = await req.json();
    const sessionId = uuidv4();

    // Store outline with session ID
    sessions[sessionId] = { outline, currentLine };

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

function findParentNode(outline: Bullet[], question: string): Bullet | null {
  // Helper function to recursively search for the parent node
  const searchParent = (
    nodes: Bullet[],
    parent: Bullet | null
  ): Bullet | null => {
    for (const node of nodes) {
      if (node.text === question) {
        return parent; // Return the parent node when match is found
      }
      if (node.subbullets && node.subbullets.length > 0) {
        const found = searchParent(node.subbullets, node);
        if (found) return found; // Return parent if found in subbullets
      }
    }
    return null; // Return null if no match is found
  };

  // Start the search from the top level, with no parent initially
  return searchParent(outline, null);
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
  const outline = sessions[sessionId].outline;
  const currentLine = sessions[sessionId].currentLine;

  if (!outline) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const question = findParentNode(outline, currentLine)?.text || "";
  const studentResponse = currentLine;

  const together = new Together();
  const responseStream = new ReadableStream({
    async start(controller) {
      try {
        const collegeReviewerResp = await together.chat.completions.create({
          model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
          messages: [
            {
              role: "system",
              content: `You are a college admissions officer at a prestigious university. You are reviewing a student's outline from a brainstorming activity.
              Think about what you still want to learn about the student. Brainstorm 4 questions relating to student's response "${studentResponse}" that you'd like to ask the student to learn more about who they are.`,
            },
            {
              role: "user",
              content: `Responses to the college application essay brainstorming activity: ${JSON.stringify(
                outline
              )}.`,
            },
          ],
          stream: false,
        });

        const collegeReviewerRespText =
          collegeReviewerResp.choices[0]?.message?.content || "";

        console.log("collegeReviewerRespText:", collegeReviewerRespText);

        const stream = await together.chat.completions.create({
          model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a college admissions consultant helping a student do personal \
                reflection to ultimately help them brainstorm for their college application essays. \
                You should engage students by asking them questions that push them to reflect more deeply \
                on their experiences so that they can write a story that is unique to them, reflects positively, \
                and makes them stand out in a competitive college application process. Good questions ask the \
                student for concrete details, unique perspectives, and vulnerability.",
            },
            {
              role: "user",
              content: `Here is the student's outline for brainstorming: ${JSON.stringify(
                outline
              )}`,
            },
            {
              role: "user",
              content: `To help you, here are questions that a college admissions officer wants to ask the student: ${collegeReviewerRespText}.`,
            },
            {
              role: "system",
              content:
                `Based on the student response: "${studentResponse}", suggest 1-2 deeper follow-up questions ` +
                `for the question "${question}"` +
                `to explore the topic further for a college application essay. Encourage and push the student as needed based on the quality of their outline.` +
                `Format the output as follows:\n\n` +
                `1. [follow up question 1]\n` +
                `2. [follow up question 2]\n` +
                `Output ONLY the follow-up questions:`,
            },
          ],
          stream: true,
        });

        let fullResponse = "";
        let lastChunk = "";

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta.content || "";
          const formattedText = text.replace(/\n/g, "\\n");
          fullResponse += formattedText;
          const bulletNum = getBulletNumber(fullResponse);
          // console.log(text);
          let strippedText = text.replace(/\n/g, ""); // text.replace(/\n\d+\./g, "");
          // console.log("lastChunk:", lastChunk);
          if (lastChunk === ".") {
            // remove leading space from strippedText
            strippedText = strippedText.slice(1);
          }
          lastChunk = strippedText;
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

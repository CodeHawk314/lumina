import { NextResponse } from "next/server";
import Together from "together-ai";

export async function GET() {
  const together = new Together();

  const responseStream = new ReadableStream({
    async start(controller) {
      try {
        const stream = await together.chat.completions.create({
          // model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
          model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a college admissions consultant helping a student do personal \
                reflection to ultimately help them brainstorm for their college application essays.",
            },
          ],
          stream: true,
        });

        // Use a for-await-of loop to handle async iterable streaming
        for await (const chunk of stream) {
          // Send each chunk to the client
          const text = chunk.choices[0]?.delta.content || "";
          const formattedText = text.replace(/\n/g, "\\n");
          controller.enqueue(`data: ${formattedText}\n\n`);
        }

        // Close the stream after data is fully sent
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

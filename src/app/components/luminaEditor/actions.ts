"use server";
import Together from "together-ai";

export const llm = async () => {
  const together = new Together();
  const stream = await together.chat.completions.create({
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
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
  return stream;
};

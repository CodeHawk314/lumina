import { NextResponse } from "next/server";
import Together from "together-ai";

export async function POST(req: Request) {
  const { outline } = await req.json();

  if (!outline) {
    return NextResponse.json({ error: "Outline not found" }, { status: 400 });
  }

  const together = new Together();
  try {
    const collegeReviewerResp = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      messages: [
        {
          role: "system",
          content: `You are a college admissions officer at a prestigious university.
          You are reviewing a student's outline from a brainstorming activity.
          Write some brief brutally honest internal notes on what you learn about what kind of student this is.
          Highlight strengths and weaknesses. Be detailed and concise, citing specific parts of their outline.
          If the outline is not that detailed, mention that in your notes.
          This is just a brainstorming outline, so don't worry about the quality of the writing.`,
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

    console.log(collegeReviewerRespText);

    const scoreAgent = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      messages: [
        {
          role: "system",
          content: `You are a college admissions officer at a prestigious university.
          Your job is to prepare a short 1 paragraph summary of the applicant to send to the committee.
          The applicant has only given an outline, so don't pay attention to writing quality.
          Your summary should give them a clear idea of what kind of person this is, for example their passions, interests, and unique life story.
          A good outline is full of concrete details which are specific to the student, and gives you a good idea of their life and demonstrated interests.
          Be brutally honest and fair.`,
        },
        {
          role: "user",
          content: `College admissions officer notes: ${collegeReviewerRespText}.`,
        },
        {
          role: "user",
          content: `Student outline: ${outline}.`,
        },
        {
          role: "system",
          content: `Give the 1 paragraph summary of the applicant. Be concise. Give your memo directly, without any introduction, headings, or formatting. Refer to USER as "the student".`,
        },
      ],
      stream: false,
    });

    const summary = scoreAgent.choices[0]?.message?.content || "";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

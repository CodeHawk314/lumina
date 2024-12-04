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
          content: `You are a college admissions officer at a prestigious university. You are reviewing a student's outline from a brainstorming activity. Write some brief brutally honest internal notes on what you learn about what kind of student this is. Highlight strengths and weaknesses. Be detailed and concise, citing specific parts of their outline. If the outline is not that detailed, mention that in your notes.`,
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
          content: `You are a college admissions officer at a prestigious university. Your job is to score applicants as accurately and fairly as possible. Be brually honest.`,
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
          content:
            `Score their outline based on the notes you've taken. Provide a score between 1 and 5, with 1 being the lowest and 5 being the highest.` +
            `Rubric: 1 - Poor. You don't get a clear idea of who the student is. 
            2 - Weak. You have some idea of the studen't story, but it could apply to many students and it lacks concrete examples, 
            3 - Good. The outline is a good start with some specific concrete details, and gives you a good idea of the student's life and demonstrated interests,
            4 - Very Good. Applicant has a detailed outline with a strong story that stands out, and would be a great addiition to this university,
            5 - Excellent. Applicant stands out above almost everyone in their uniqueness, depth, and detail. Reserve this score for the top 5% of applicants.`,
        },
        {
          role: "system",
          content: `Give the score and only the score in the following JSON format: {"score": outline_score}`,
        },
      ],
      stream: false,
    });

    const scoreAgentText = scoreAgent.choices[0]?.message?.content || "";
    console.log(scoreAgentText);
    const score = JSON.parse(scoreAgentText).score;
    console.log(score);

    return NextResponse.json({ score });
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

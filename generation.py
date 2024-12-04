# import openai
import random
import os
from together import Together
from dotenv import load_dotenv

load_dotenv(dotenv_path="./.env.local")

# Run line below in terminal to set up together ai API key
# export TOGETHER_API_KEY=ba1f969850aff90a61277544c46b4afb81183cf1d5f86a059615ee7fe5c24a56

client = Together()

# Initial questions drawn from brainstorming resources
initial_questions = [
    "Tell the story of a time you laughed so hard you cried.",
    "What is your favorite quote?",
    "Which teacher or coach made the biggest impact on you, and how?",
    "When was a time you were most afraid?",
    "What is the most difficult decision you’ve ever had to make? What made it hard or easy?",
    "What is your favorite book and why?",
    "Which family member are you closest to? Do you have a favorite grandparent?",
    "What is the best money you’ve ever spent?",
    "What is your biggest pet peeve or a bad habit of yours?",
    "Do you have a recurring dream? Is there something that makes you cringe?",
    "Have you ever been in love? Describe a memorable experience.",
    "What is your favorite family tradition?",
    "Why is your best friend your best friend?",
    "When was the last time you were speechless?",
    "What are your biggest strengths and weaknesses? How would others describe them?",
    "If you could only choose one topic to talk about for the rest of your life, what would it be?",
    "Have you traveled? If so, what did you do or learn?",
    "If you could choose any meal to represent you, what would it be and why?",
    "What is the most interesting part of your daily life?",
    "Describe a time when you felt inexperienced at something.",
    "Is there a question about the universe that keeps you up at night?",
    "Where do you feel most at home?",
    "What’s the most sensory experience you’ve ever had?",
    "Have you had a job? What was your most memorable experience? What did you learn?",
    "What’s the funniest thing that’s happened to you?",
    "Write about a time when you felt out of place.",
    "Are there any social issues you’re passionate about? If so, what have you done to contribute?",
    "Finish this sentence: “I feel most creative when I…”",
    "Write about your most memorable classroom experience.",
    "Describe a time when you felt like you genuinely helped someone.",
    "What role do you play when working in a group or team?",
    "What’s the most profound thing that’s happened to you?",
    "Are you a leader? If so, how, when, and in what parts of your life?",
    "What would your friends say is your greatest strength? What would your family say?",
    "What are three things you know to be true?",
    "What motivates you?",
    "Think about times when you were out of your comfort zone. What happened?",
    "What is your least proud moment? How did you handle it?",
    "When have you failed? What was that experience like?",
    "When have you been ostracized or witnessed someone being ostracized? Why is this memorable to you?",
    "Think about your family’s quirks and history. What makes your family unique?",
    "Is there a historical figure you would like to talk to? Why?",
    "Is there a problem you've solved or would like to solve? What is it?",
    "What do you do in your free time? Why?",
    "Think of your favorite works of art or books. What draws you to them?",
    "What makes your home different from others? What does it say about your upbringing?",
    "What is your favorite subject and why?",
    "How do you spend your time outside of school?",
    "What are your most unique talents?",
    "What is important to you?",
    "What is a life lesson you’ve learned, especially the hard way?",
    "What is the most unusual thing you’ve ever done?",
    "What is the most interesting place you’ve ever visited or traveled to?",
    "What is an accomplishment or achievement you are most proud of?",
    "What is an obstacle or challenge you have had to overcome?",
    "Who is someone in your life you are inspired by and why?",
    "What jobs have you held, and what have you liked or disliked about them?",
    "How are you different from your friends or classmates?",
    "What is your relationship like with your family?",
    "How would your best friend describe you? How would your parents or siblings?",
    "If you had a “do-over” in your life, what would you do differently and why?",
    "What are three adjectives that best describe you? Why?",
    "What are some things important for colleges to know about you?",
    "What is your happiest memory? Why was it good?",
    "What is your saddest memory? What did you learn?",
    "What is the most important decision you've had to make? What were the consequences?",
    "If you could go back in time to give yourself advice, when would it be and what would you say?",
    "What is the most dangerous or scary thing that you've lived through? How did you cope?",
    "When did you first feel like you were no longer a child? What triggered that feeling?",
    "What are you most proud of about yourself?",
    "Which of your parents are you most like? Which traits do you share?",
    "Which of your grandparents has influenced your life the most? How?",
    "Which teacher has challenged you the most? What was the challenge?",
    "What is something that someone once said to you that has stuck with you?",
    "If you could intern for anyone, living or dead, who would it be and what would you want to learn?",
    "Of the people you know personally, whose life is harder than yours? Why?",
    "Of the people you know personally, whose life is easier than yours? Are you jealous?",
    "When is the last time you lost track of time while doing something? What were you doing?",
    "Where do you most often tend to daydream? Why?",
    "What is the best and worst time of day for you? Why?",
    "What is your favorite space in your home, and why?",
    "What is your least favorite space in your home, and why?",
    "If you could repeat any day of your life, which would it be and why?",
    "If you could take a Mulligan and do over one thing in your life, what would it be?",
    "Which piece of yourself could you never change? Why?",
    "Which of your beliefs puts you in the minority? Why?",
    "What are you most frightened of? What are you not frightened enough of?",
    "What is your most treasured possession? What’s its story?",
    "What skill or talent that you don’t have would you most like to have?",
    "Which traditions from your upbringing will you pass on, and which will you ignore?",
    "What everyday thing are you the world's greatest at? Who taught you?",
    "What do you most like about yourself? Describe a time this was useful.",
    "What has been the greatest moment in your life?",
    "What was the worst moment of your life?",
    "What is the most disgusting food that you like?",
    "What is one item or object you associate with your Mom or Dad?",
    "What’s more important to you: financial stability or doing what you love?",
    "What will your life look like in 10 years? Where will you be living?",
    "How will you get to where you want to be?",
    "What are 21 details from your life, interesting facts that describe some small, random part of who you are?",
    "What is something you’re really opinionated about?",
    "What is your biggest flaw, and what, if anything, have you done to try to overcome it?",
    "What’s the most recent thing you researched on your own (not for school)?",
    "What’s something unique about your community, and how has this influenced you?",
    "What’s something you regret?",
    "What are your top five values? What stories demonstrate these values?",
    "Have you ever changed a belief that you were previously very sure about? Who or what caused this shift?",
    "When have you encountered someone with beliefs or values different from your own? How did that experience change or solidify your own beliefs?",
    "What are some activities or accomplishments you’re proud of?",
    "What’s a topic that you could give an hour-long lecture about?",
    "What’s your favorite TV show or film? Why?",
    "What are 10 things you’d take to a desert island?",
    "If your life were a movie, what songs would be on the soundtrack, and why?",
    "What objects do people think of when they think of you?",
    "What is your real-life superpower and kryptonite?",
    "What’s your “life motto”?",
    "What are the top three things you want colleges to know about you?",
    "What is your most valued childhood memory?",
    "Have you been responsible for caring for family members? How has this impacted your academics, goals, and values?",
    "If different from your current place of residence, does your home country or place of birth have special meaning for you?",
    "What has been your most significant cross-cultural experience? Why? How did it change your perspective?",
    "Can you identify trends in your commitments? What do they say about your values and abilities?",
    "Discuss an accomplishment in which you exercised leadership. How effective were you in motivating or guiding others?",
    "Think of a time when you truly helped someone. What did you do? How did this impact the other person? How did your actions impact you?",
    "Give an example of when you exhibited creativity. Describe your thoughts and actions.",
    "Reflect on a time in which you failed to accomplish what you set out to do. How did you recover from that failure?",
    "What was an important risk that you took? Why did you take this risk? What was the outcome? Would you do it again?",
    "What are your career aspirations, and how will college help you to reach them?",
    "What unique skills and experiences do you have to offer the school, your fellow students, the faculty, the broader community?",
    "Why do you think you will succeed in college?",
    "Name a current obstacle to the realization of your goals. What causes this problem? What are you doing to change it?"
]

# Randomly select a subset of initial questions
def select_initial_questions(num_questions=5):
    return random.sample(initial_questions, num_questions)

# Generate follow-up questions based on student response
def generate_followup_questions(student_response):
    # Construct the message for Together API call
    messages = [
        {
            "role": "user",
            "content": (
                f"Based on the following student response, suggest several deeper follow-up questions "
                f"to explore the topic further for a college application essay. Format the output as follows:\n\n"
                f"Student Response: [student response]\n"
                f"1. [follow up question 1]\n"
                f"2. [follow up question 2]\n"
                f"3. [follow up question 3]\n"
                f"(Continue listing as needed)\n\n"
                f"Student's response: '{student_response}'\n\n"
                f"Output ONLY the follow-up questions:"
            ),
        }
    ]

    response = client.chat.completions.create(
        model="meta-llama/Llama-3-70b-chat-hf",
        messages=messages,
        stream=True
    )

    # Collects and prints out response from streaming generator (follow-up questions)
    complete_response = ""
    for token in response:
        if hasattr(token, 'choices'):
            complete_response += token.choices[0].delta.content      

    # Split the complete response into individual follow-up questions
    follow_up_questions = complete_response.strip().split('\n')

    # Clean the list by removing any empty strings and formatting
    follow_up_questions = [question.strip() for question in follow_up_questions if question.strip()]

    # Return a dict with the student response and follow-up questions
    return {
        "student_response": student_response,
        "follow_up_questions": follow_up_questions
    }

def generate_feedback(context):
    # Construct the message for TogetherAI API call
    admissions_consultant_messages = [
        {
            "role": "system",
            "content": (
                f"You are a college admissions consultant and are working with a student (the user) to generate a list of potential essay topics"
                f"the student can use for their college application essays based on a brainstorming activity in which the student has been asked follow-up questions"
                f"tailored to their responses to the brainstorming questions. Please provide your response in markdown format."
            ),
        },
        {"role": "user", "content": f"Here are my responses to the college application essay brainstorming activity: {context}. What are some topics I should write about for my essays?"}
    ]

    admissions_officer_messages = [
        {
            "role": "system",
            "content": (
                f"You are a college admissions officer and are providing assistance to a student (the user) to generate a list of potential essay topics"
                f"the student can use for their college application essays based on a brainstorming activity in which the student has been asked follow-up questions"
                f"tailored to their responses to the brainstorming questions. Please provide your response in markdown format."
            ),
        },
        {"role": "user", "content": f"Here are my responses to the college application essay brainstorming activity: {context}. What are some topics I should write about for my essays?"}
    ]

    consultant_response = client.chat.completions.create(
        model="meta-llama/Llama-3-70b-chat-hf",
        messages=admissions_consultant_messages,
        stream=False
    )

    ao_response = client.chat.completions.create(
    model="meta-llama/Llama-3-70b-chat-hf",
    messages=admissions_officer_messages,
    stream=False
    )

    full_consultant_response = consultant_response.choices[0].message.content
    full_ao_response = ao_response.choices[0].message.content
    return full_consultant_response, full_ao_response

# Completes one round of brainstorming
def brainstorming_round(questions, initial_round):
    # Step 1: Collect responses from the student
    student_responses = {}
    for idx, question in enumerate(questions, start=1):
        response = input(f"Answer for Question {idx}: {question}\nYour response: ")
        if initial_round and response == "":
            print("\nPlease provide a response to for this initial round of questions")
            response = input(f"Answer for Question {idx}: {question}\nYour response: ")
        student_responses[question] = response

    # Step 2: Generate follow-up questions based on student responses
    all_follow_up_questions = {}
    for question, response in student_responses.items():
        follow_up_data = generate_followup_questions(response)
        all_follow_up_questions[question] = follow_up_data["follow_up_questions"]

    # Step 3: Display follow-up questions
    print("\n\nGenerated Follow-Up Questions:")
    for initial_question, follow_up_questions in all_follow_up_questions.items():
        student_response = student_responses[initial_question]
        print(f"\nFor the question: '{initial_question}'")
        print(f"Student's response: '{student_response}'")
        print("Follow-up questions inspired by this response:")
        for follow_up_question in follow_up_questions:
            print(follow_up_question, "\n")

    # Ask if the user wants to continue another round
    if not initial_round:
        continue_response = input("Would you like to continue brainstorming? (yes or no): ").strip().lower()
        if continue_response != 'yes':
            return questions, False, student_responses  # Stop further rounds
    selected_questions = [question[3:] for sublist in all_follow_up_questions.values() for question in sublist]
    return selected_questions, True, student_responses  # Continue to another round


def main():
    # Step 1: Select initial questions
    # Change num_questions back to 5 when not debugging
    selected_questions = select_initial_questions(num_questions=5)
    print("Initial Questions:")
    for idx, question in enumerate(selected_questions, start=1):
        print(f"{idx}. {question}")

    # Store student responses across all rounds
    all_student_responses = {}

     # Step 2: Begin brainstorming with initial questions
    continue_brainstorming = brainstorming_round(selected_questions, initial_round=True)
    all_student_responses.update(continue_brainstorming[2])

    # Subsequent rounds of brainstorming with follow-up questions
    while continue_brainstorming[1]:
        print("\nStarting a new round of brainstorming.")
        # Repeat brainstorming
        continue_brainstorming = brainstorming_round(continue_brainstorming[0], initial_round=False)
        all_student_responses.update(continue_brainstorming[2])

    print("You have concluded brainstorming. We will now present potential essay topics of interest.\n")

    # Step 3: Perform analysis on provided user responses
    context = "\n".join(
        [f"Q: {q}\n A: {a}" for q, a in all_student_responses.items() if a]
    )
    topics = generate_feedback(context)
    print(topics)


# Run the main function
if __name__ == "__main__":
    main()
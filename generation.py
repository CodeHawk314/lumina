import openai
import random

# Set up OpenAI API key
openai.api_key = "insert API key here"

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
    "What do you most like about yourself? Describe a time this was useful."
]

# Randomly select a subset of initial questions
def select_initial_questions(num_questions=5):
    return random.sample(initial_questions, num_questions)

# Generate follow-up questions based on a student response
def generate_followup_questions(student_response):
    prompt = (
        f"Based on the following student response, suggest several deeper follow-up questions "
        f"to explore the topic further:\n\n"
        f"Student's response: '{student_response}'\n\nFollow-up questions:"
    )
    
    # OpenAI API call to generate follow-up questions
    response = openai.Completion.create(
        engine="gpt-4",
        prompt=prompt,
        max_tokens=150,
        temperature=0.7,
        n=1
    )
    
    # Process the response to get a list of follow-up questions
    follow_up_questions = [
        question.strip() 
        for question in response.choices[0].text.strip().split('\n') 
        if question.strip()
    ]
    
    return follow_up_questions

def main():
    # Step 1: Select initial questions
    selected_questions = select_initial_questions(num_questions=5)
    print("Initial Questions:")
    for idx, question in enumerate(selected_questions, start=1):
        print(f"{idx}. {question}")

    # Step 2: Collect responses from the student
    student_responses = {}
    for idx, question in enumerate(selected_questions, start=1):
        # Placeholder for now, replace with student response from frontend
        response = input(f"Answer for Question {idx}: {question}\nYour response: ")
        student_responses[question] = response

    # Step 3: Generate follow-up questions based on student responses
    all_follow_up_questions = {}
    for question, response in student_responses.items():
        follow_up_questions = generate_followup_questions(response)
        all_follow_up_questions[question] = follow_up_questions

    # Step 4: Display all follow-up questions for each initial question
    print("\nGenerated Follow-Up Questions:")
    for initial_question, follow_up_questions in all_follow_up_questions.items():
        student_response = student_responses[initial_question]
        print(f"\nFor the question: '{initial_question}'")
        print(f"Student's response: '{student_response}'")
        print("Follow-up questions inspired by this response:")
        for follow_up_question in follow_up_questions:
            print("-", follow_up_question)

# Run the main function
if __name__ == "__main__":
    main()
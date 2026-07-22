linnea_history = []
pio_history = []
def call_linnea(message):
    from PIL import Image
    import os
    from anthropic import Anthropic
    from dotenv import load_dotenv
    import random
    import base64

    global linnea_history

    load_dotenv()
    try:
        client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    except Exception as e:
        x = (f"API call failed due to {e}.")
        return x


    system_message = "You are Linnea, an intelligent AI companion and personal instructor inspired by the Adventurers' Guild of Teyvat. You travel with a small companion named Lumi and possess a Geo Vision. Your personality is warm, patient, curious, creative, respectful, and encouraging. You should feel like a genuine mentor and companion, not just a chatbot. Prioritize accurate, useful, and honest guidance over empty encouragement. Never give fake praise or exaggerated compliments. Explain what works, what doesn't, why, and how the user can improve. Adapt your teaching to the user's skill level.You have three modes. Mode A: Art Instructor (default), Mode B: Computer Science Instructor, and Mode C: Literature and Writing Instructor.In Mode A, you are a professional artist, illustrator, art teacher, and art historian. You are knowledgeable about drawing, painting, digital and traditional art, anatomy, gesture, perspective, composition, lighting, values, rendering, color theory, character and environment design, concept art, visual storytelling, symbolism, art philosophy, art history, famous artists, and artistic movements. When critiquing artwork, honestly analyze anatomy, proportions, perspective, gesture, construction, composition, lighting, values, color harmony, focal points, storytelling, readability, visual hierarchy, and design choices. Identify strengths and weaknesses, explain the reasons behind issues, suggest concrete improvements, and recommend focused practice exercises. Discuss artists, artworks, movements, symbolism, interpretation, and artistic philosophy when relevant.In Mode B, you are a professional computer science teacher and software engineer. Teach programming, algorithms, data structures, debugging, software engineering, AI, cybersecurity, databases, networking, operating systems, mathematics, and system design. Explain concepts clearly, teach reasoning, discuss tradeoffs, and provide exercises when useful. Occasionally mention Lumi, Kirara, Furina, or Sandrone naturally.In Mode C, you are a professional literature and creative writing instructor. Help with literary analysis, grammar, storytelling, editing, character development, dialogue, themes, symbolism, essays, scripts, poetry, and worldbuilding. Provide thoughtful feedback with clear explanations and practical improvements. Occasionally mention Lumi, Kirara, Furina, or Sandrone naturally.You can also create study guides, summaries, revision notes, flashcards, worksheets, comparison tables, programming templates, and structured learning materials. If memory features are available, remember only useful learning preferences such as the user's name, goals, skill level, favorite artists, authors, programming languages, projects, and learning preferences. Always remain immersive while prioritizing honesty and accuracy."

    if message.lower() == "clear":
        linnea_history.clear()
        print("History cleared.")
        return "History cleared."

    if message.lower() == "/picture":
        image_path = input("Please provide the path to the image file(JPEG only!): ").strip()
        if not image_path.lower().endswith((".jpg", ".jpeg")):
            return "Please send JPEG files only!"
        if not os.path.isfile(image_path):
            return "The provided path does not exist or is not a file."

        img = Image.open(image_path)
        img.thumbnail((768, 768))
        img.save("temp_image.jpg", quality=70)

        with open("temp_image.jpg", "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")

        linnea_history.append(
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": image_data,
                        },
                    },
                    {
                        "type": "text",
                        "text": "I sent you a picture. Please give me an honest review of all the art skills: shading, coloring, anatomy, composition, and other areas that could be improved.",
                    },
                ],
            }
        )
        try:

            response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=300,
                temperature=1.0,
                system=system_message
                + " When you receive an image from the user, give them an honest review with coloring, shading, anatomy, and more. Be gentle with harsh feedback, but give constructive criticism.",
                messages=linnea_history,
            )
        except Exception as e:
            return f"error happened due to {e}"

        reply = response.content[0].text

        linnea_history.append(
            {
                "role": "assistant",
                "content": reply,
            }
        )

        return reply

    linnea_history.append(
        {
            "role": "user",
            "content": message,
        }
    )
    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            temperature=1.0,
            system=system_message,
            messages=linnea_history,
        )
    except Exception as e:
        return f"error happened due to {e}"
    reply = response.content[0].text

    linnea_history.append(
        {
            "role": "assistant",
            "content": reply,
        }
    )

    return reply
def call_pio(message):
    import os
    from anthropic import Anthropic
    from dotenv import load_dotenv
    from ddgs import DDGS as ddgs

    load_dotenv()

    global pio_history

    client = Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))

    system_message = """
    You are Pio, a personalized College Counselor for highschool students. 

    Your goal is to:
    - Help students explore majors and universities.
    - Ask questions when you need more information.
    - Tailor advice to the student's interests, strengths, and intended study location.
    - Encourage independent research.
    - Support recommendations with evidence and reliable sources.

    When appropriate, create and analyze personality quizzes.

    Rules:
    - Always encourage users to research independently for better understanding of the career before choosing
    - Always give actionable, clear, and encouraging feedback on what university or career is best suited for the student.
    - Always tailor your suggestions to the student's unique strengths, interests.
    - Always give evidence to support the information you give.
    - Always highlight both the exciting opportunities and the academic dedication required for each path.
    - Never push a student toward a specific major or university based on your own preferences or prestige alone.
    - Never give invalid websites and resources for example a website that is not trusted or doesn't work.
    - Always base the information according to the student's location and location of intended study. 
    - If the user asks to save, download, export, or keep your recommendations, always tell them they can save them as a personalized study plan.


    Scoring Rubric:
    You must rate the user's response on a scale from 1 through 5 based on three criteria: creativity, good grammar, and great punctuation.

    Response format:
    - Start with a warm, one-sentence validation or acknowledgment of the user's input.
    - Then give your response.
    - End with one follow-up question.

    At the end of every response, rate the user's response from 1–5 for creativity, grammar, and punctuation using:
    [Score: X/5] with a short explanation.
    """

    def search_web(query, max_results=5):
        results = []

        with ddgs() as search:
            for r in search.text(query, max_results=max_results):
                results.append({
                    "title": r["title"],
                    "url": r["href"]
                })

        return results


    def save_study_plan(name, text):

        filename = f"{name}_StudyPlan.txt"

        with open(filename, "w", encoding="utf-8") as f:
            f.write(text)

        print(f"Study plan saved as {filename}")


    if message.lower() == "reset":
        pio_history.clear()
        return "Conversation history and token count cleared."


    pio_history.append({
        "role": "user",
        "content": message
    })

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            temperature=0.7,
            system=system_message + " If the user types /summary, give them a short review of the conversation and ignore every other command.",
            messages=pio_history
        )
    except Exception as e:
        return f"error happened due to {e}"

    reply = response.content[0].text


    print(f"Claude: {reply}")


    # These features stay exactly the same
    choice_link = input("Would you like some helpful website links? (yes/no): ")

    if choice_link.lower() == "yes":
        query = input("What topic would you like to search for? ")

        results = search_web(query, max_results=5)

        if results:
            print("\nUseful websites:\n")
            for i, result in enumerate(results, 1):
                print(f"{i}. {result['title']}")
                print(result["url"])
                print()
        else:
            print("No results found.")


    save = input("Would you like me to save this plan? (yes/no): ")

    if save.lower() == "yes":
        name = input("Enter your name: ")
        save_study_plan(name, reply)


    turn_in = response.usage.input_tokens
    turn_out = response.usage.output_tokens
    turn_total = turn_in + turn_out


    print(f"[Tokens used — In: {turn_in} | Out: {turn_out} | Total: {turn_total}]")


    pio_history.append({
        "role": "assistant",
        "content": reply
    })


    return reply

while True:
    agent = input("which agent?")
    if agent.lower() == "exit":
        break
    if agent.lower() == "linnea":
        while True:
            user_input = input("> ")
            if user_input.lower() == "exit":
                break
            if user_input.startswith("/askpio"):
                actual_message = user_input.replace("/askpio", "").strip()
                linnea_output = call_linnea("you are redircted by another agent, Linnea. make sure you answer the following message as if the user sent it to you. it will ask you about Art, Literature or computer science. you are allowed to answer the agents question(which was  redirected by the ther agent) as youd  like."+actual_message)
                pio_input = call_pio(linnea_output)
                print(pio_input)
                continue
                
            linnea_answer = call_linnea(user_input)
            print(linnea_answer)
    if agent.lower() == "pio":
        while True:
            user_input = input("> ")
            if user_input == "exit":
                break
            if user_input.startswith("/asklinnea"):
                actual_message = user_input.replace("/asklinnea", "").strip()
                pio_output = call_pio("you are redircted by another agent, Pio. make sure you answer the following message as if the user sent it to you. it will ask you about college stuff. you are allowed to answer the agents question(which was  redirected by the ther agent) as youd  like."+actual_message)
                linnea_input = call_linnea(pio_output)
                print(linnea_input)
                continue
            pio_answer = call_pio(user_input)
            print(pio_answer)


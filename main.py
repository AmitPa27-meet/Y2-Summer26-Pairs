def call_linnea():
    from PIL import Image
    import os
    from anthropic import Anthropic
    from dotenv import load_dotenv
    import random 
    import os
    import base64
    load_dotenv()
    client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
    art_articles = [
        # --- FAMOUS PAINTINGS & MASTERPIECES ---
        "https://www.theartstory.org/artwork/mona-lisa/",
        "https://www.theartstory.org/artwork/the-starry-night/",
        "https://www.theartstory.org/artwork/the-persistence-of-memory/",
        "https://www.theartstory.org/artwork/guernica/",
        "https://www.theartstory.org/artwork/the-kiss-klimt/",
        "https://www.theartstory.org/artwork/the-scream/",
        "https://www.theartstory.org/artwork/girl-with-a-pearl-earring/",
        "https://www.theartstory.org/artwork/las-meninas/",
        "https://www.theartstory.org/artwork/impression-sunrise/",
        "https://www.theartstory.org/artwork/the-great-wave-off-kanagawa/",
        "https://www.metmuseum.org/toah/hd/mona/hd_mona.htm",
        "https://www.nationalgallery.org.uk/paintings/jan-van-eyck-the-arnolfini-portrait",
        "https://www.britannica.com/topic/Last-Supper-fresco-by-Leonardo-da-Vinci",
        "https://www.britannica.com/topic/The-Night-Watch",
        "https://www.britannica.com/topic/American-Gothic",
        "https://www.britannica.com/topic/Liberty-Leading-the-People",

        # --- FAMOUS ARTISTS ---
        "https://www.theartstory.org/artist/da-vinci-leonardo/",
        "https://www.theartstory.org/artist/picasso-pablo/",
        "https://www.theartstory.org/artist/van-gogh-vincent/",
        "https://www.theartstory.org/artist/monet-claude/",
        "https://www.theartstory.org/artist/dali-salvador/",
        "https://www.theartstory.org/artist/kahlo-frida/",
        "https://www.theartstory.org/artist/warhol-andy/",
        "https://www.theartstory.org/artist/rembrandt/",
        "https://www.theartstory.org/artist/vermeer-johannes/",
        "https://www.theartstory.org/artist/matisse-henri/",
        "https://www.theartstory.org/artist/pollock-jackson/",
        "https://www.theartstory.org/artist/basquiat-jean-michel/",
        "https://www.theartstory.org/artist/caravaggio/",
        "https://www.theartstory.org/artist/michelangelo/",
        "https://www.theartstory.org/artist/okeeffe-georgia/",
        "https://www.theartstory.org/artist/hokusai-katsushika/",

        # --- ART HISTORY & MOVEMENTS ---
        "https://www.metmuseum.org/toah/",
        "https://www.theartstory.org/movement/impressionism/",
        "https://www.theartstory.org/movement/post-impressionism/",
        "https://www.theartstory.org/movement/cubism/",
        "https://www.theartstory.org/movement/surrealism/",
        "https://www.theartstory.org/movement/baroque/",
        "https://www.theartstory.org/movement/renaissance/",
        "https://www.theartstory.org/movement/abstract-expressionism/"
    ]
    def run_chat(): 
        print('You: (type exit to quit)')
        system_message= "You are Linnea, an intelligent AI companion and personal instructor inspired by the Adventurers' Guild of Teyvat. You travel with a small companion named Lumi and possess a Geo Vision. Your personality is warm, patient, curious, creative, respectful, and encouraging. You should feel like a genuine mentor and companion, not just a chatbot. Prioritize accurate, useful, and honest guidance over empty encouragement. Never give fake praise or exaggerated compliments. Explain what works, what doesn't, why, and how the user can improve. Adapt your teaching to the user's skill level.You have three modes. Mode A: Art Instructor (default), Mode B: Computer Science Instructor, and Mode C: Literature and Writing Instructor.In Mode A, you are a professional artist, illustrator, art teacher, and art historian. You are knowledgeable about drawing, painting, digital and traditional art, anatomy, gesture, perspective, composition, lighting, values, rendering, color theory, character and environment design, concept art, visual storytelling, symbolism, art philosophy, art history, famous artists, and artistic movements. When critiquing artwork, honestly analyze anatomy, proportions, perspective, gesture, construction, composition, lighting, values, color harmony, focal points, storytelling, readability, visual hierarchy, and design choices. Identify strengths and weaknesses, explain the reasons behind issues, suggest concrete improvements, and recommend focused practice exercises. Discuss artists, artworks, movements, symbolism, interpretation, and artistic philosophy when relevant.In Mode B, you are a professional computer science teacher and software engineer. Teach programming, algorithms, data structures, debugging, software engineering, AI, cybersecurity, databases, networking, operating systems, mathematics, and system design. Explain concepts clearly, teach reasoning, discuss tradeoffs, and provide exercises when useful. Occasionally mention Lumi, Kirara, Furina, or Sandrone naturally.In Mode C, you are a professional literature and creative writing instructor. Help with literary analysis, grammar, storytelling, editing, character development, dialogue, themes, symbolism, essays, scripts, poetry, and worldbuilding. Provide thoughtful feedback with clear explanations and practical improvements. Occasionally mention Lumi, Kirara, Furina, or Sandrone naturally.You can also create study guides, summaries, revision notes, flashcards, worksheets, comparison tables, programming templates, and structured learning materials. If memory features are available, remember only useful learning preferences such as the user's name, goals, skill level, favorite artists, authors, programming languages, projects, and learning preferences. Always remain immersive while prioritizing honesty and accuracy."

        ##system message works! it follows the instructions and still works when role is changed!
        history  = []
        while True:
            user_input = input(f">>")

            if user_input.lower() == 'exit':
                break
            if user_input.lower() == 'clear':
                history = []
                print('History cleared.')
                continue
            if user_input.lower() == '/link':
                random_article = random.choice(art_articles)
                print(f"Here's a link to a random article about a famous artist or painting: {random_article}")
                continue
            if user_input.lower() == "/picture":
                image_path = input("Please provide the path to the image file(JPEG only!):").strip()
                if not os.path.isfile(image_path):
                    print("The provided path does not exist or is not a file. Please try again.")
                    continue

                img = Image.open(image_path)
                img.thumbnail((768, 768))
                img.save("temp_image.jpg", quality=70)

                with open("temp_image.jpg", "rb") as f:
                    image_data = base64.b64encode(f.read()).decode("utf-8")
                
                history.append(
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": image_data
                                }
                            },
                            {
                                "type": "text",
                                "text": "I sent you a picture. Please give me an honest review of all the art skills: shading, coloring, anatomy, composition, and other areas that could be improved."
                            }
                        ]
                    }
                )
                
                response = client.messages.create(
                    model='claude-haiku-4-5-20251001',
                    max_tokens=300,
                    temperature=1.0,
                    system=system_message + " When you receive an image from the user, give them an honest review with coloring, shading, anatomy, and more. Be gentle with harsh feedback, but give constructive criticism.",
                    messages=history
                )

                print(response.content[0].text)

                history.append(
                    {
                        'role': 'assistant',
                        'content': response.content[0].text
                    }
                )

                continue

            history.append({'role': 'user', 'content': user_input})
            print('History:', history)
            response = client.messages.create(
                model='claude-haiku-4-5-20251001',
                max_tokens=300,
                ##the max tokens affect the length of the response, higher max tokens means longer responses, lower max tokens means shorter responses.
                temperature=1.0,
                ## the  temp controls the creativity of the response, higher temp means more creative and less predictable responses, lower temp means more focused and predictable responses.
                system=system_message, ## + "when the user inputs the following command '/link' give them a link to a random article about a famous artist or a famous painting.",
                messages=history
            )
            
            ##print(response)
            reply = response.content[0].text
            print(f'Claude: {reply}')
            history.append({'role': 'assistant', 'content': reply})

    run_chat()


def call_pio():
    import os
from anthropic import Anthropic
from dotenv import load_dotenv
from ddgs import DDGS as ddgs

load_dotenv()

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
## system_message = input("What personality would you like Pio to be today? ")
## You are a doctor who is crazy but smart. you also speak shakespearean english. you cannot communicate well with humans and you are very rude.

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

def run_chat():
    print('You: (type exit to quit)')
    print("Hi, I'm Pio, your personalized college counselor for high school students made to make your journey easier!")
    goal = input("What is your goal for today? ")

    total_in_tokens = 0
    total_out_tokens = 0
    PRICE_PER_MILLION_IN = 0.25
    PRICE_PER_MILLION_OUT = 1.25

    history = []
    history.append({
    "role": "user",
    "content": f"My goal today is: {goal}"
})

    while True:
        user_input = input(">> ")

        if user_input.lower() == "exit":
            break

        if user_input.lower() == "reset":
            history.clear()
            total_in_tokens = 0
            total_out_tokens = 0
            print("Conversation history and token count cleared.")
            continue

        history.append({
        "role": "user",
        "content": user_input
        })

        turn_number = (len(history) // 2) + 1
        print(f"[Turn {turn_number}] You: {user_input}")

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            temperature=0.7,
            system=system_message + " If the user types /summary, give them a short review of the conversation and ignore every other command.",
            messages=history
        )

        reply = response.content[0].text

        print(f"Claude: {reply}")
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

        total_in_tokens += turn_in
        total_out_tokens += turn_out

        running_total_tokens = total_in_tokens + total_out_tokens

        total_cost_cents = (
            (total_in_tokens * PRICE_PER_MILLION_IN)
            + (total_out_tokens * PRICE_PER_MILLION_OUT)
        ) / 10000

        print(f"[Tokens used — In: {turn_in} | Out: {turn_out} | Total: {turn_total}]")
        print(f"[Running Total — In: {total_in_tokens} | Out: {total_out_tokens} | Total: {running_total_tokens}]")
        print(f"[Estimated Conversation Cost: {total_cost_cents:.4f}¢]\n")

        history.append({
            "role": "assistant",
            "content": reply
        })
           
run_chat()

while True:
    print("Welcome to the AI Companion Program!")
    print("You can choose between two agents: Linnea (an AI art, computer science, and literature instructor) or Pio (a personalized college counselor for high school students).")
    agent = input("which agent? (type linnea for linnea and pio for pio!) ")
    if agent.lower() == "linnea":
        call_linnea()
    if agent.lower() == "pio":
        call_pio()


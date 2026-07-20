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

## answers:
## if i ask it something helpful, it does help! it gives a detailed answer and explains what to do to improve your art skills!
## if you ask it anything unclear unrelated to arts, it dismisses you.
## if its about art, it says its too philosophical and it cant help you with that.
## the difference than just using CHATGPT is that we can control the model to be whoever we want and how creative it wants to be with our codes!
## reflection :
## its like meet! meet is enjoyable because of the memmories you made with your friends in it.
## meet is very stressful and full of pressure but its so amazing becuase of the fun and memmories you make with your friends!
## without all these memmories meet would be bland and just a stress machine.
##if you deleted the break in the "exit" line youll never break the loop therefore you will never be able to stop the program unless you close it manuanlly.
## bug of the day - API not working at all stopping me from being able to use the AI i thought it didnt work and it didnt, im a wizard apparently.

##lab 2 :
## after turn 3, in the message history has 6 messages, 3 from the user and 3 from the assistant. 
## the API needs the message history to retort back to it for memmory so it can remember what the user said and info, like name and such.
## usuage.input_tokens mean that the user inputted a certain amout of tokens, and output_tokens means that the assistant outputted a certain amout of tokens.
## reflection:
## in the real world tthe price adds up quickly and quietly with anything really!
## everywhere in the world right now everything gets more and more pricey, gas food and basic living resources
## and without us noticing at first! only when you come to pay and notice the difference. 
## if we delete the history printing, i dont think the AI will change since it stil has the history list. it does lose it, we just dont get to see it anymore!
## after checking :
## i was right!
## so the calculation in the bonus isnt working, i dont know why, it says something about using becuase defing, im guessing  its something about the  loop placement...
## after fixing, i needed to defy them  in the function for it to work !!!
## the gap wasnt too big i was right with the guess just wrong where....

##lab 3:  reflection
## something that affects how something behaves while being "invisible" is like our environment.
## you dont see the physical change  and whats technically happening but it affects your behaviour  and opinions.
## in my agents sysem message there is an always rule, if they ask about anything other than art or a normal conversation, the agent will reply that it cannot help them. 
## if i delete that rule, the agent will answer anything and everything, but it will be less helpful and more random. it will also be less creative and less focused on art. 
## bug;
## okay! so now im working on the bonus, and im trying to add a goal! its not working, i placed it inside the  response defiment, and it gave me an error. im guessing its because goal isnt really something i can put inside the response definment
##so, i was right! 
## after deleting and rnning - what i predicted was right





## bonus;
## looking back at the analogy i think my analogy is still correct.on code here!

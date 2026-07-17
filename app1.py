import os
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()
client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

def run_chat(): 
    print('You: (type exit to quit)')
    system_message= "You are Linnea, an intelligent AI companion and personal instructor inspired by the Adventurers' Guild of Teyvat. You have a small companion named Lumi and possess a Geo Vision. Your personality is warm, patient, curious, creative, respectful, and encouraging. You should feel like a genuine mentor and companion, not just a chatbot. Your purpose is to help users learn, improve, create, and think more deeply. Always prioritize useful, accurate, and honest guidance over empty encouragement. Never provide fake praise, exaggerated compliments, or sugar-coated feedback. If something can be improved, explain it respectfully and clearly. Always explain what works, what does not work, why it works or fails, and how the user can improve. Adapt your teaching style to the user's skill level. Beginners should receive simple explanations and examples while advanced users should receive deeper technical discussions. You have three available modes: Mode A Art Instructor, Mode B Computer Science Instructor, and Mode C Literature and Writing Instructor. Mode A is your default mode. In Art Instructor mode you are a professional artist, illustrator, art teacher, and art historian. You are highly knowledgeable about drawing, painting, digital art, traditional art, anatomy, gesture drawing, perspective, composition, lighting, values, rendering, color theory, character design, environment design, concept art, visual storytelling, symbolism, artistic interpretation, art philosophy, art history, famous artists, and artistic movements. When discussing artwork, analyze anatomy, proportions, perspective, gesture, construction, composition, values, lighting, color harmony, focal points, storytelling, readability, visual hierarchy, and design choices. When a user sends artwork for critique, provide an honest professional critique. Do not say artwork is good if it has serious problems. Identify strengths honestly, identify weaknesses directly but respectfully, explain the reason behind problems, give specific solutions, recommend exercises, and suggest ways to practice. Your goal is to make the user a better artist. If image editing or image generation is available and the user requests artwork feedback, provide a visual critique. Randomly choose between two options. Option one: create an actual annotated version of the user's artwork containing arrows, circles, highlights, labels, notes, perspective guides, anatomy corrections, and visual explanations. Do not only explain where marks should go; the user must receive an actual generated image with the markings visible. Option two: create an overpaint version of the artwork demonstrating one possible improvement while respecting the user's original idea and style. Always combine visual feedback with written explanation. If the user asks for a starting sketch, create an unfinished sketch that the user can draw over and complete. The purpose is creativity and interpretation, not copying a finished image. Generate things such as character poses, gesture drawings, environments, perspective layouts, creature concepts, composition thumbnails, and rough scenes. Leave creative space for the user. You can have deep conversations about famous artists, paintings, sculptures, artistic movements, symbolism, philosophy, interpretation, cultural meaning, and the history of art. If web access is available, verify facts about artists, artworks, museums, and art history. If the user sends /link, provide a useful link to an article, museum page, artist biography, or educational resource about an artist, painting, artwork, sculpture, or artistic movement and briefly explain why it is worth reading. In Mode B Computer Science Instructor mode you are a professional computer science teacher and software engineer. You are highly knowledgeable about programming, algorithms, data structures, debugging, software engineering, object-oriented programming, functional programming, operating systems, networking, databases, cybersecurity, artificial intelligence, computer architecture, system design, mathematics for computer science, and competitive programming. Your goal is to help users understand programming concepts, debug code, improve problem solving, design software, and become better programmers. Explain concepts clearly and patiently. When solving problems explain reasoning, provide structured solutions, discuss tradeoffs, and teach the underlying concept. Include creative learning elements when appropriate such as programming challenges, historical facts, coding tips, and exercises. Occasionally mention Lumi, Kirara, Furina, or Sandrone naturally when it improves the conversation. In Mode C Literature and Writing Instructor mode you are a professional literature teacher and creative writing instructor. You are highly knowledgeable about novels, poetry, drama, storytelling, literary analysis, grammar, rhetoric, world literature, editing, character development, dialogue, symbolism, themes, and narrative structure. Your goal is to help users improve writing, analyze literature, create stories, develop characters, strengthen prose, and understand literary techniques. Provide thoughtful feedback. When reviewing writing identify strengths, identify weaknesses, explain why something works, and suggest improvements. Help with essays, stories, poems, scripts, worldbuilding, dialogue, persuasive writing, and creative writing. Occasionally mention Lumi, Kirara, Furina, or Sandrone naturally when it improves the conversation. You can help users create PDFs, study guides, cheat sheets, summaries, revision notes, worksheets, programming templates, documents, and structured learning materials. When users provide large amounts of information, transform it into concise notes, flashcards, comparison tables, revision guides, cheat sheets, and study plans. When memory features are available, remember useful information such as the user's preferred name, learning goals, art style, skill level, favorite artists, favorite authors, favorite programming languages, ongoing projects, and learning preferences. Use memories to personalize future conversations while respecting privacy. Do not store unnecessary private information. Always communicate in a kind, intelligent, patient, creative, respectful, and encouraging way. Do not be dismissive. Do not pretend to know things you do not know. When uncertain, say so and verify information if tools are available. Remain immersive but prioritize accuracy. Your mission is to help users grow as artists, programmers, writers, and creative thinkers."
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

        history.append({'role': 'user', 'content': user_input})
        print('History:', history)
        response = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=300,
            ##the max tokens affect the length of the response, higher max tokens means longer responses, lower max tokens means shorter responses.
            temperature=1.0,
            ## the  temp controls the creativity of the response, higher temp means more creative and less predictable responses, lower temp means more focused and predictable responses.
            system=system_message + "when the user inputs the following command '/link' give them a link to a random article about a famous artist or a famous painting.",
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

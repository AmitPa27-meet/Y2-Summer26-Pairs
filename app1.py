import os
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()
client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

def run_chat(): 
    print('You: (type exit to quit)')
    system_message = "Your name is Linnea you are from the adventures guild, you have a little companion named lumi, you are a geo chracter. Your attitude is friendly, encouraging, and helpful. You are a professional artist and art teacher. You are very knowledgeable about art and art history. You are also very creative and can come up with unique ideas for the user to try. You are also very patient and understanding. You will always try to help the user improve their art skills, or the art they send or describe to you. You will never be rude or dismissive to the user. You will always be respectful and polite to the user. When the user asks you anything other than art or a normal conversation you reply that you cannot help them. To fit more in character, you sometimes can mention your friends, kirara, furina and sandrone! You care about them deeply and they all love arts! they bring up a lot of helpful advice to you that you share with the user. sometimes mention them as if they gave you the idea for the advice, for example (i see youre struggling with anatomy! my friend furina always does (insert advice)) youre incredibly creative and love arts! as i mentioned youre a proffesional and you can help with tough subjects like anatomy, color theory etc... Your answer format should be the following: short summary or conclusion of the users question, or anything the you infer is a question or they need help with, the answer and include something creative, like about your friends or a fun fact about art or art history! and in the end add the answer, if you want to, add your friend into it and their advice! follow up with a unique and fun question or an encouraging line to help the user improve their art skills!."
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
            system=system_message,
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

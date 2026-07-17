import os
from anthropic import Anthropic
from dotenv import load_dotenv
from googlesearch import search


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
def save_study_plan(name, text):

    filename = f"{name}_StudyPlan.txt"

    with open(filename, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"Study plan saved as {filename}")

def run_chat():
    print('You: (type exit to quit)')
    print("Hi, I'm Pio, your personalized college counselor for high school students made to make your journey easier!")
    goal = input("What is your goal for today? ")
    print(goal)
    

    total_in_tokens = 0
    total_out_tokens = 0
    total_cost_usd = 0.0
    PRICE_PER_MILLION_IN = 0.25
    PRICE_PER_MILLION_OUT = 1.25

    history = []

    ##user_scores = []
    
    
    while True:
        user_input = input('>> ')

        if user_input.lower() == 'exit':
            break
        if user_input.lower() == 'reset':
            history.clear()
            total_in_tokens = 0
            total_out_tokens = 0
            total_cost_usd = 0.0
            print("Conversation history and token count cleared.")
            continue

        save = input("Would you like me to save this plan? (yes/no): ")
        if save.lower() == "yes":
            save_study_plan(student_name, reply)
        else: 
            continue

        history.append({'role': 'user', 'content': goal + user_input})
        turn_number = (len(history) // 2) + 1
        print(f"[Turn {turn_number}] You: {user_input}")
        ##print(f"History: {history}")
        
        response = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=300,
            temperature=0.7,
            system=system_message +"if the user types /summary in the input, give them a short review about all the conversation you guys had. ignore every command when the user types in /summary",
            messages=history)

        reply = response.content[0].text
        ##print(response) 
        print(f'Claude: {reply}')
        turn_in = response.usage.input_tokens
        turn_out = response.usage.output_tokens
        turn_total = turn_in + turn_out
        total_in_tokens += turn_in
        total_out_tokens += turn_out
        running_total_tokens = total_in_tokens + total_out_tokens
        total_cost_cents = ((total_in_tokens * PRICE_PER_MILLION_IN) + (total_out_tokens * PRICE_PER_MILLION_OUT)) / 10000
            
            
        print(f"[Tokens used — In: {turn_in} | Out: {turn_out} | Total: {turn_total}]")
            
           
        print(f"[Running Total — In: {total_in_tokens} | Out: {total_out_tokens} | Total: {running_total_tokens}]")
            
    
        print(f"[Estimated Conversation Cost: {total_cost_cents:.4f}¢]\n")
            
        history.append({'role': 'assistant', 'content': reply})
    ##if user_scores:
        ##average = sum(user_scores) / len(user_scores)
        ##print(f"Your final average score for this session is: {average:.2f}/5")
    ##else:
        ##print("There is no score to desplay")
run_chat()
##Lab 1 + Bonuses 1,2,3:
##Step 2:
##    1. I asked it to sing me a song about computer science and tech. It delivered verses with encouraging words. I asked him to explain the .text function and it explain it to me. I also asked him to say it to me in simple words and it did. In addition, I asked it to explain computer science to me and parts of it and it was like a teacher. Lastly, I asked it should i research a topic more on my own, and it encouraged me to be curious.
##    2. Already done in #1. It helped me with what I needed.
##    3. "What is the best way to do a thing?", I asked it and it encouraged me to do things right but asked to provide it more details. 
##    4. The difference is that the terminal works directly in the chatbot instead of a seoerate web browser. 

##Step 3: All shown above. 

##Reflection:
##    1. Updated Analogy: Exiting a chatbot is like shutting down Uncharted 4 without saving; your unsaved progress vanishes, and you must restart from the beginning. 
##    2. - "load_dotenv" deleted --> It will start but it will crash later when it tries to use the missing variable because it will not be able to find the environment variable (API key).
##       - Temperature set to 0.7 deleted --> The AI will respond in a more wild and creative way and may also go of the track of the question.
##       - "if user_input.lower() == 'exit':" deleted --> When you try to stop the program, it will not stop on any condition and will keep running.
##    3. Dear Diary, Today I encountred an error in my code. It's the 401 error. I tried to use the pep protocol and got me to my guess that the API key was Disabled, then I thought that maybe the code was not as advanced as the model of Anthropic. It turns out that I need to do virtual environment which Lil and Samar helped me with. lucky to have them!! Andre OUT. 
## Bonuses are with the code. 

##--------------------------------------------------------------------------------------------------------------------------------------------------


##Lab 2 + Bonuses 1,2,3 
##Step 1: - Usage.input_tokens are the number of tokens sent to the model from me. Its my chat history or any files i sent it.
##        - Usage.output_tokens are the number of tokens created from the model to reply to me.
##Step 2: - Really long message: It will reply but in a short output because max_tokens controls the tokens of the output and not the input.
##        - Tokens = 300: It will reply in a long output because the tokens are more.
##        - Temperature = 0: The answers are mostly identical with and it stayed in character. 
##        - Temperature = 1: The answers are different and diverse in tone and character.
##        - Temperature controls the predictability vs. randomness of the model's responses by changing the shift of the words.
##Step 3: - It has 6 messages. 
##        - The API has no memory, it doesn't save my chats on its servers, it forgets always. 
##Reflection: 
##        1. You can see it as the air condition is in your home. The long hot days run, the longer the AC is on, and the higher price you pay for the electricity.
##        2. - The user line is deleted: The AI will receive empty messages and therefore reducing the number of input_tokens.
##           - The assitant line deleted: The AI will forget its own replies and my tokens will grow slowly due to the fact that the AI is not reading its own replies because it forgot them.
##           - The print history is deleted: The Ai won't change (logic) because it has the history but what we won't see is the messay code being printed. The debugging Output is only the visibility to the user but if removed it won't change the logic (code) of the AI. 
##        3. Dear Diary, today I encountered another error sadly. I think it was the 400 error code. I was doing the trying out different tokens in the code to see what happened. I thought that max_tokens meant that it was the maximum the user can write. It turns out its the maximum the AI can write. Anwaysss, I thought that the code crashed because of I wrote too many lines but I googled it like Roni told me and it turns out that my message was blank. Look at the difference. But its good that I googled it :) Today was an interesting day. see you tomorrow!!


##---------------------------------------------------------------------------------------------------------------------------------------------------
##Lab 3 + Bonuses 1, 2, 3
##Step 3: - I asked it five things and it stayed in character never breaking the rules. It remembers earlier messages.
##        - I asked it about making a sandwich. It didn't crash and ignored the question and cotinued what its role is supposed to. 
## Reflection: 
##        1. It's like your morals, they control how you interact with others and no outsider sees them except if you let them know what your morals are.
##        2. - system=system_message deleted: It will not use the written system_message and will intead use defualt settings as a Claude.
##           - "Never push a student toward a specific major or university based on your own preferences or prestige alone" deleted: If deleted, every time a student asks Pio to pick a major for them based on its preferences, it will.
##           - "End with one follow-up question" deleted: It will stop asking a follow up question to increase curiosity.
##        3. Dear Diary, another day of coding :( and another bug. Pio crashed and I thought its because I dleted the system_message, but then I readded it and it didn't work. It turns out the problem was with the WiFi because its not private, I conneted the computer to another WiFi router and it WORKED!! Thanks to Roni ofc :)
##        4. BONUS: The analogy still makes sense and I reworded it anyway above. 


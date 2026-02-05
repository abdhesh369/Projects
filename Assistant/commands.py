import os
import datetime
import webbrowser
import pyautogui
import pywhatkit
import wikipedia
import pyjokes
import psutil
import requests
from utils import speak
import speech_recognition as sr
import sounddevice as sd
import wave
import tempfile

def listen_for_note():
    # Re-implementing a simple listen for note taking to avoid circular imports
    # In a full app, this might be in a shared audio module
    recognizer = sr.Recognizer()
    try:
        # Assuming we can reuse the same settings or import them
        # For simplicity, using defaults here or if main.py passes the listener it's better.
        # But this function was called within a command.
        # Let's simple use a minimal version or ask user to speak clearly.
        with sr.Microphone() as source:
             print("Listening for note...")
             audio = recognizer.listen(source, timeout=5)
             return recognizer.recognize_google(audio)
    except Exception:
        return None

def cmd_name(text):
    speak("my name is edith")

def cmd_age(text):
    speak("i am 1 year old")

def cmd_time(text):
    time = datetime.datetime.now().strftime("%I:%M %p")
    speak(f"The current time is {time}")

def cmd_youtube(text):
    speak("Opening YouTube")
    webbrowser.open("https://www.youtube.com")

def cmd_portfolio(text):
    speak("Opening your portfolio")
    webbrowser.open("https://www.abdheshsah.com.np")

def cmd_joke(text):
    joke = pyjokes.get_joke(language="en", category="neutral")
    speak(joke)

def cmd_play_video(text):
    video_paths = [r"D:\Videos", os.path.expanduser(r"~\Videos")]
    found_path = None
    
    for path in video_paths:
        if os.path.exists(path):
            found_path = path
            break
    
    if found_path:
        play = os.listdir(found_path)
        if play:
            speak(f"Playing video from {found_path}")
            os.startfile(os.path.join(found_path, play[0]))
        else:
            speak("No videos found in the folder")
    else:
        speak("Could not find a Videos folder")

def cmd_wikipedia(text):
    speak("Searching Wikipedia...")
    query = text.replace("wikipedia", "").strip()
    try:
        results = wikipedia.summary(query, sentences=2)
        speak("According to Wikipedia")
        print(results)
        speak(results)
    except Exception:
        speak("I couldn't find any information on Wikipedia about that.")

def cmd_search(text):
    query = text.replace("search", "").strip()
    speak(f"Searching for {query}")
    pywhatkit.search(query)

def cmd_play_song(text):
    song = text.replace("play", "").strip()
    speak(f"Playing {song}")
    pywhatkit.playonyt(song)

def cmd_screenshot(text):
    img = pyautogui.screenshot()
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"screenshot_{timestamp}.png"
    img.save(filename)
    speak(f"Screenshot taken and saved as {filename}")

def cmd_open_notepad(text):
    speak("Opening Notepad")
    os.system("notepad.exe")

def cmd_open_calculator(text):
    speak("Opening Calculator")
    os.system("calc.exe")

def cmd_battery(text):
    battery = psutil.sensors_battery()
    percentage = battery.percent
    speak(f"System is at {percentage} percent battery")

def cmd_system_health(text):
    cpu = psutil.cpu_percent()
    ram = psutil.virtual_memory().percent
    speak(f"CPU usage is at {cpu} percent and RAM usage is at {ram} percent")

def cmd_check_disk(text):
    disk = psutil.disk_usage('C:')
    total = round(disk.total / (1024**3), 2)
    free = round(disk.free / (1024**3), 2)
    speak(f"In C drive, total space is {total} gigabytes and free space is {free} gigabytes")

def cmd_volume_up(text):
    pyautogui.press("volumeup")
    speak("Increasing volume")

def cmd_volume_down(text):
    pyautogui.press("volumedown")
    speak("Decreasing volume")

def cmd_mute(text):
    pyautogui.press("volumemute")
    speak("Toggling mute")

def cmd_weather(text):
    speak("Searching for weather info")
    pywhatkit.search("current weather")

def cmd_date(text):
    date = datetime.datetime.now().strftime("%B %d, %Y")
    speak(f"Today is {date}")

def cmd_ip(text):
    try:
        ip = requests.get('https://api.ipify.org').text
        speak(f"Your public IP address is {ip}")
    except Exception:
        speak("I'm sorry, I couldn't fetch your IP address right now.")

def cmd_close_notepad(text):
    speak("Closing Notepad")
    os.system("taskkill /f /im notepad.exe")

def cmd_close_calculator(text):
    speak("Closing Calculator")
    os.system("taskkill /f /im calc.exe")

def cmd_make_note(text):
    # This requires listening again. 
    # Since we are in commands.py, and listen() is in main.py, 
    # we can either duplicate the listen logic or pass a listener.
    # For now, let's use a simple input prompt via console or a local listen helper could be added.
    # However, 'listen()' in main uses sounddevice/sr. 
    # Let's assume we simply prompt for now or fail gracefully if we can't listen.
    speak("What should the note say?")
    
    # We'll use a local instance of recognizer for this specific command 
    # to avoid circular import of 'listen' from main
    r = sr.Recognizer()
    try:
        with sr.Microphone() as source:
            print("Listening for note...")
            audio = r.listen(source, timeout=5)
        note_content = r.recognize_google(audio)
    except:
        note_content = None

    if note_content:
        with open("notes.txt", "a") as f:
            f.write(f"{datetime.datetime.now()}: {note_content}\n")
        speak("I've saved your note.")
    else:
        speak("I couldn't hear the note content.")

def cmd_read_notes(text):
    if os.path.exists("notes.txt"):
        with open("notes.txt", "r") as f:
            content = f.read()
        if content:
            speak("Here are your notes.")
            print(content)
            speak(content)
        else:
            speak("Your notes file is empty.")
    else:
        speak("You don't have any notes saved.")

def cmd_exit(text):
    speak("Goodbye")
    exit()

# Dispatcher Dictionary
# Format: "keyword": function
# We will iterate nicely to find matches
COMMAND_MAP = {
    "your name": cmd_name,
    "old are you": cmd_age,
    "now time": cmd_time,
    "youtube": cmd_youtube,
    "portfolio": cmd_portfolio,
    "joke": cmd_joke,
    "play video": cmd_play_video,
    "wikipedia": cmd_wikipedia,
    "search": cmd_search,
    "play": cmd_play_song,
    "screenshot": cmd_screenshot,
    "open notepad": cmd_open_notepad,
    "open calculator": cmd_open_calculator,
    "battery": cmd_battery,
    "system health": cmd_system_health,
    "cpu usage": cmd_system_health,
    "check disk": cmd_check_disk,
    "volume up": cmd_volume_up,
    "volume down": cmd_volume_down,
    "mute": cmd_mute,
    "weather": cmd_weather,
    "date today": cmd_date,
    "ip address": cmd_ip,
    "close notepad": cmd_close_notepad,
    "close calculator": cmd_close_calculator,
    "make a note": cmd_make_note,
    "read notes": cmd_read_notes,
    "exit": cmd_exit,
    "stop": cmd_exit
}

import pyttsx3
import speech_recognition as sr
import sounddevice as sd
import wave
import tempfile
import webbrowser
import os
import datetime
import pyautogui
import pywhatkit
import wikipedia
import pyjokes
import psutil
import requests


def speak(x):
    print(f"Edith: {x}")
    try:
        engine = pyttsx3.init()
        voices = engine.getProperty("voices")
        if len(voices) > 1:
            engine.setProperty("voice", voices[1].id)
        else:
            engine.setProperty("voice", voices[0].id)
        engine.setProperty("rate", 150)
        engine.say(x)
        engine.runAndWait()
        engine.stop()
        del engine
    except Exception as e:
        print(f"Speech error: {e}")


def listen():
    recognizer = sr.Recognizer()
    samplerate = 16000
    duration = 5
    channels = 1
    
    print("Listening....")
    try:
        audio_data = sd.rec(int(samplerate * duration), samplerate=samplerate, 
                           channels=channels, dtype='int16')
        sd.wait()
        print("Recognizing...")
        
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
            temp_path = tmp_file.name
            with wave.open(temp_path, 'wb') as wf:
                wf.setnchannels(channels)
                wf.setsampwidth(2)  
                wf.setframerate(samplerate)
                wf.writeframes(audio_data.tobytes())
        
        with sr.AudioFile(temp_path) as source:
            audio = recognizer.record(source)
        
        os.unlink(temp_path)
        
        data = recognizer.recognize_google(audio)
        print(data)
        return data.lower()
    except sr.UnknownValueError:
        print("Could not understand audio. Try again..")
        return None
    except sr.RequestError as e:
        print(f"Error with speech recognition service: {e}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None


def wish_me():
    hour = int(datetime.datetime.now().hour)
    if 0 <= hour < 12:
        speak("Good Morning!")
    elif 12 <= hour < 18:
        speak("Good Afternoon!")
    else:
        speak("Good Evening!")
    speak("I am Edith. How can I help you today?")


def handle_command(data1):
    if "your name" in data1:
        speak("my name is edith")

    elif "old are you" in data1:
        speak("i am 1 year old")

    elif "now time" in data1:
        time = datetime.datetime.now().strftime("%I:%M %p")
        speak(f"The current time is {time}")

    elif "youtube" in data1:
        speak("Opening YouTube")
        webbrowser.open("https://www.youtube.com")

    elif "portfolio" in data1:
        speak("Opening your portfolio")
        webbrowser.open("https://www.abdheshsah.com.np")

    elif "joke" in data1:
        joke = pyjokes.get_joke(language="en", category="neutral")
        speak(joke)

    elif "play video" in data1:
        add = r"D:\Videos"
        if os.path.exists(add):
            play = os.listdir(add)
            if play:
                speak("Playing video from your collection")
                os.startfile(os.path.join(add, play[0]))
            else:
                speak("No videos found in the folder")
        else:
            speak("Directory not found")

    elif "wikipedia" in data1:
        speak("Searching Wikipedia...")
        query = data1.replace("wikipedia", "").strip()
        try:
            results = wikipedia.summary(query, sentences=2)
            speak("According to Wikipedia")
            print(results)
            speak(results)
        except Exception:
            speak("I couldn't find any information on Wikipedia about that.")

    elif "search" in data1:
        query = data1.replace("search", "").strip()
        speak(f"Searching for {query}")
        pywhatkit.search(query)

    elif "play" in data1:
        song = data1.replace("play", "").strip()
        speak(f"Playing {song}")
        pywhatkit.playonyt(song)

    elif "screenshot" in data1:
        img = pyautogui.screenshot()
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"screenshot_{timestamp}.png"
        img.save(filename)
        speak(f"Screenshot taken and saved as {filename}")

    elif "open notepad" in data1:
        speak("Opening Notepad")
        os.system("notepad.exe")

    elif "open calculator" in data1:
        speak("Opening Calculator")
        os.system("calc.exe")

    elif "battery" in data1:
        battery = psutil.sensors_battery()
        percentage = battery.percent
        speak(f"System is at {percentage} percent battery")

    elif "system health" in data1 or "cpu usage" in data1:
        cpu = psutil.cpu_percent()
        ram = psutil.virtual_memory().percent
        speak(f"CPU usage is at {cpu} percent and RAM usage is at {ram} percent")

    elif "check disk" in data1:
        disk = psutil.disk_usage('C:')
        total = round(disk.total / (1024**3), 2)
        free = round(disk.free / (1024**3), 2)
        speak(f"In C drive, total space is {total} gigabytes and free space is {free} gigabytes")

    elif "volume up" in data1:
        pyautogui.press("volumeup")
        speak("Increasing volume")

    elif "volume down" in data1:
        pyautogui.press("volumedown")
        speak("Decreasing volume")

    elif "mute" in data1:
        pyautogui.press("volumemute")
        speak("Toggling mute")

    elif "weather" in data1:
        speak("Searching for weather info")
        pywhatkit.search("current weather")

    elif "date today" in data1:
        date = datetime.datetime.now().strftime("%B %d, %Y")
        speak(f"Today is {date}")

    elif "ip address" in data1:
        try:
            ip = requests.get('https://api.ipify.org').text
            speak(f"Your public IP address is {ip}")
        except Exception:
            speak("I'm sorry, I couldn't fetch your IP address right now.")

    elif "close notepad" in data1:
        speak("Closing Notepad")
        os.system("taskkill /f /im notepad.exe")

    elif "close calculator" in data1:
        speak("Closing Calculator")
        os.system("taskkill /f /im calc.exe")

    elif "make a note" in data1:
        speak("What should the note say?")
        note_content = listen()
        if note_content:
            with open("notes.txt", "a") as f:
                f.write(f"{datetime.datetime.now()}: {note_content}\n")
            speak("I've saved your note.")
        else:
            speak("I couldn't hear the note content.")

    elif "read notes" in data1:
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

    elif "exit" in data1 or "stop" in data1:
        speak("Goodbye")
        exit()


if __name__ == "__main__":
    wish_me()
    while True:
        data1 = listen()
        if data1:
            handle_command(data1)

import speech_recognition as sr
import sounddevice as sd
import wave
import tempfile
import os
import datetime
from utils import speak
from commands import COMMAND_MAP

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
    # Iterate through command mappings
    # We check if the keyword is IN the spoken text (data1)
    for keyword, handler in COMMAND_MAP.items():
        if keyword in data1:
            handler(data1)
            return


if __name__ == "__main__":
    wish_me()
    while True:
        data1 = listen()
        if data1:
            handle_command(data1)

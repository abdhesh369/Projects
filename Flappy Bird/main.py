import random
import sys
import pygame
from pygame.locals import *
FPS = 32
SCREEN_WIDTH = 600
SCREEN_HEIGHT = 800
x = pygame.init()
FPSCLOCK = pygame.time.Clock()
display = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("My Game")
Ground_y = SCREEN_HEIGHT*0.8
Game_Sprites = {}
Game_Sounds = {}
Player = 'Public/bird.png'
Background = 'Public/Background.jpg'
Pipe = 'Public/Pipe.png'

def welcome_screen():
    playerx = int(SCREEN_WIDTH/5)
    playery = int((SCREEN_HEIGHT - Game_Sprites['player'].get_height())/2)
    messagex = int((SCREEN_WIDTH - Game_Sprites['message'].get_width())/2)
    messagey = int(SCREEN_HEIGHT*0.13)
    basex = 0
    while True:
        for event in pygame.event.get():
            if event.type == QUIT or (event.type == KEYDOWN and event.key == K_ESCAPE):
                pygame.quit()
                sys.exit()
            elif event.type == KEYDOWN and (event.key == K_SPACE or event.key == K_UP):
                return
            else:
                display.blit(Game_Sprites['background'], (0, 0))
                display.blit(Game_Sprites['player'], (playerx, playery))
                display.blit(Game_Sprites['message'], (messagex, messagey))
                display.blit(Game_Sprites['base'], (basex, Ground_y))
                pygame.display.update()
                FPSCLOCK.tick(FPS)


game_exit = False

clock = pygame.time.Clock()
Game_Sprites['number'] = (
    pygame.image.load('Public/0.png').convert_alpha(),
    pygame.image.load('Public/1.png').convert_alpha(),
    pygame.image.load('Public/2.png').convert_alpha(),
    pygame.image.load('Public/3.png').convert_alpha(),
    pygame.image.load('Public/4.png').convert_alpha(),
    pygame.image.load('Public/5.png').convert_alpha(),
    pygame.image.load('Public/6.png').convert_alpha(),
    pygame.image.load('Public/7.png').convert_alpha(),
    pygame.image.load('Public/8.png').convert_alpha(),
    pygame.image.load('Public/9.png').convert_alpha(),
)
import os
if os.path.exists("Public/message.png"):
    Game_Sprites['message'] = pygame.image.load("Public/message.png").convert_alpha()
else:
    print("Warning: message.png not found!")
Game_Sprites['base'] = pygame.image.load('Public/base.png').convert_alpha()
Game_Sprites['pipe'] = (
    pygame.transform.rotate(pygame.image.load(
        'Public/Pipe.png').convert_alpha(), 180),
    pygame.image.load('Public/Pipe.png').convert_alpha()
)

Game_Sounds['die'] = pygame.mixer.Sound('Public/die.mp3')
Game_Sounds['hit'] = pygame.mixer.Sound('Public/hit.mp3')
Game_Sounds['point'] = pygame.mixer.Sound('Public/point.mp3')
Game_Sounds['swoosh'] = pygame.mixer.Sound('Public/swoosh.mp3')
Game_Sounds['wing'] = pygame.mixer.Sound('Public/wing.mp3')

Game_Sprites['background'] = pygame.image.load(
    'Public/Background.jpg').convert()
Game_Sprites['player'] = pygame.image.load(
    'Public/bird.png').convert_alpha()


while True:
    welcome_screen()
    main_game()
    
    display.blit(Game_Sprites['background'], (0, 0))


while not game_exit:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            game_exit = True

        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_RIGHT:
                game_exit = True

    pygame.display.update()
    clock.tick(60)

pygame.quit()
quit()

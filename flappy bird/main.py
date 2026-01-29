import pygame
x=pygame.init()
display=pygame.display.set_mode((1000,1000))
pygame.display.set_caption("My Game")

game_exit=False

clock = pygame.time.Clock()

while not game_exit:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            game_exit = True

    pygame.display.update()
    clock.tick(60)

pygame.quit()
quit()
import os
import random
import sys
import json
import pygame
from pygame.locals import *

FPS = 60
SCREEN_WIDTH = 400
SCREEN_HEIGHT = 700
GROUND_Y_RATIO = 0.85
PIPE_GAP = 160
PIPE_FREQUENCY = 1500

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
SKY_BLUE = (135, 206, 235)


class Bird:
    """Player bird class with animation and physics"""
    
    def __init__(self, x, y, sprite):
        self.x = x
        self.y = y
        self.sprite = sprite
        self.width = sprite.get_width()
        self.height = sprite.get_height()
           
        self.velocity = 0
        self.gravity = 0.5
        self.flap_strength = -8
        self.max_velocity = 10
        self.min_velocity = -8
        self.angle = 0
        
        self.flap_cooldown = 0
        
    def flap(self):
        """Make the bird jump"""
        if self.flap_cooldown <= 0:
            self.velocity = self.flap_strength
            self.flap_cooldown = 10
            return True
        return False
    
    def update(self):
        """Update bird physics"""
        self.velocity += self.gravity
        self.velocity = max(min(self.velocity, self.max_velocity), self.min_velocity)
        
        self.y += self.velocity
        
        if self.flap_cooldown > 0:
            self.flap_cooldown -= 1
        
        self.angle = max(-30, min(self.velocity * 3, 90))
        
    def get_rect(self):
        """Get collision rectangle"""
        return pygame.Rect(self.x, self.y, self.width, self.height)
    
    def draw(self, surface):
        """Draw the bird with rotation"""
        rotated_sprite = pygame.transform.rotate(self.sprite, -self.angle)
        rect = rotated_sprite.get_rect(center=(self.x + self.width//2, self.y + self.height//2))
        surface.blit(rotated_sprite, rect.topleft)


class Pipe:
    """Pipe obstacle class"""
    
    def __init__(self, x, gap_y, pipe_sprite_top, pipe_sprite_bottom, velocity):
        self.x = x
        self.gap_y = gap_y
        self.pipe_top = pipe_sprite_top
        self.pipe_bottom = pipe_sprite_bottom
        self.velocity = velocity
        self.width = pipe_sprite_top.get_width()
        self.height = pipe_sprite_top.get_height()
        self.passed = False
        
    def update(self):
        """Move pipe left"""
        self.x += self.velocity
        
    def get_top_rect(self):
        """Get top pipe collision rect"""
        top_height = self.gap_y - PIPE_GAP // 2
        return pygame.Rect(self.x, top_height - self.height, self.width, self.height)
    
    def get_bottom_rect(self):
        """Get bottom pipe collision rect"""
        bottom_y = self.gap_y + PIPE_GAP // 2
        return pygame.Rect(self.x, bottom_y, self.width, self.height)
    
    def draw(self, surface):
        """Draw both pipes"""
        top_height = self.gap_y - PIPE_GAP // 2
        surface.blit(self.pipe_top, (self.x, top_height - self.height))
        
        bottom_y = self.gap_y + PIPE_GAP // 2
        surface.blit(self.pipe_bottom, (self.x, bottom_y))
    
    def is_off_screen(self):
        """Check if pipe has moved off screen"""
        return self.x < -self.width


class Game:
    """Main game class"""
    
    def __init__(self):
        pygame.init()
        pygame.mixer.init()
        
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Flappy Bird")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(None, 48)
        self.font_large = pygame.font.Font(None, 72)
        
        self.state = "MENU"
        self.score = 0
        self.high_score = self.load_high_score()
        self.difficulty = 1
        
        self.load_assets()
        
        self.reset_game()
        
    def load_assets(self):
        """Load all game assets procedurally in memory"""
        self.sprites = {}
        self.sounds = {}
        
        # Pure code generation instead of loading from files
        self.sprites['bird'] = self.create_bird_sprite()
        self.sprites['background'] = self.create_gradient_background()
        self.sprites['pipe_top'], self.sprites['pipe_bottom'] = self.create_pipe_sprites()
        self.sprites['ground'] = self.create_ground_sprite()
        
        # Disable sounds for pure code version (maintaining keys for compatibility)
        self.sounds = {
            'wing': None,
            'point': None,
            'hit': None,
            'die': None
        }

    def create_bird_sprite(self):
        """Create a default bird sprite"""
        size = 34
        sprite = pygame.Surface((size, size), pygame.SRCALPHA)
        pygame.draw.ellipse(sprite, (255, 255, 0), (2, 2, size-4, size-4))
        pygame.draw.ellipse(sprite, (255, 200, 0), (2, 2, size-4, size-4), 2)
        pygame.draw.circle(sprite, WHITE, (22, 12), 6)
        pygame.draw.circle(sprite, BLACK, (24, 12), 3)
        pygame.draw.polygon(sprite, (255, 100, 0), [(26, 14), (32, 16), (26, 18)])
        pygame.draw.ellipse(sprite, (255, 220, 0), (6, 16, 14, 10))
        return sprite
    
    def create_gradient_background(self):
        """Create a gradient sky background"""
        bg = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        for y in range(SCREEN_HEIGHT):
            color = (
                int(135 - y * 0.1),
                int(206 - y * 0.1),
                int(235 - y * 0.05)
            )
            pygame.draw.line(bg, color, (0, y), (SCREEN_WIDTH, y))
        return bg
    
    def create_pipe_sprites(self):
        """Create default pipe sprites"""
        width = 52
        height = 400
        
        bottom = pygame.Surface((width, height), pygame.SRCALPHA)
        pygame.draw.rect(bottom, (0, 200, 0), (0, 0, width, height))
        pygame.draw.rect(bottom, (0, 150, 0), (0, 0, width, height), 3)
        pygame.draw.rect(bottom, (0, 180, 0), (-2, 0, width+4, 30))
        pygame.draw.rect(bottom, (0, 130, 0), (-2, 0, width+4, 30), 3)
        pygame.draw.line(bottom, (100, 255, 100), (5, 30), (5, height), 3)
        
        top = pygame.transform.rotate(bottom, 180)
        
        return top, bottom
    
    def create_ground_sprite(self):
        """Create ground sprite"""
        width = SCREEN_WIDTH + 100
        height = int(SCREEN_HEIGHT * (1 - GROUND_Y_RATIO)) + 20
        ground = pygame.Surface((width, height), pygame.SRCALPHA)
        
        pygame.draw.rect(ground, (34, 139, 34), (0, 0, width, 15))
        pygame.draw.rect(ground, (139, 69, 19), (0, 15, width, height - 15))
        for i in range(0, width, 20):
            pygame.draw.line(ground, (160, 82, 45), (i, 15), (i, height), 2)
        
        return ground
    
    def load_high_score(self):
        """High score persists only during session in pure code version"""
        return 0
    
    def save_high_score(self):
        """No disk persistence in pure code version"""
        pass
    
    def reset_game(self):
        """Reset game state for new game"""
        self.bird = Bird(80, SCREEN_HEIGHT // 2, self.sprites['bird'])
        self.pipes = []
        self.ground_x = 0
        self.score = 0
        self.difficulty = 1
        self.last_pipe_time = pygame.time.get_ticks()
        self.pipe_velocity = -3
        self.pipe_frequency = PIPE_FREQUENCY
        self.grace_period = 30  # Frames of invincibility after starting
    
    def spawn_pipe(self):
        """Spawn a new pipe pair"""
        min_gap_y = PIPE_GAP // 2 + 50
        max_gap_y = int(SCREEN_HEIGHT * GROUND_Y_RATIO) - PIPE_GAP // 2 - 50
        gap_y = random.randint(min_gap_y, max_gap_y)
        
        pipe = Pipe(
            SCREEN_WIDTH + 50,
            gap_y,
            self.sprites['pipe_top'],
            self.sprites['pipe_bottom'],
            self.pipe_velocity
        )
        self.pipes.append(pipe)
    
    def check_collision(self):
        """Check for collisions"""
        bird_rect = self.bird.get_rect()
        
        if self.bird.y + self.bird.height >= int(SCREEN_HEIGHT * GROUND_Y_RATIO):
            return True
        
        if self.bird.y < 0:
            return True
        
        for pipe in self.pipes:
            if bird_rect.colliderect(pipe.get_top_rect()):
                return True
            if bird_rect.colliderect(pipe.get_bottom_rect()):
                return True
        
        return False
    
    def update_difficulty(self):
        """Increase difficulty based on score"""
        new_difficulty = 1 + self.score // 5
        if new_difficulty > self.difficulty:
            self.difficulty = new_difficulty
            self.pipe_velocity = max(-8, -3 - self.difficulty * 0.5)
            self.pipe_frequency = max(800, PIPE_FREQUENCY - self.difficulty * 100)
    
    def handle_events(self):
        """Handle input events"""
        for event in pygame.event.get():
            if event.type == QUIT:
                pygame.quit()
                sys.exit()
            
            if event.type == KEYDOWN:
                if event.key == K_ESCAPE:
                    pygame.quit()
                    sys.exit()
                
                if self.state == "MENU":
                    if event.key in (K_SPACE, K_UP, K_RETURN):
                        self.state = "PLAYING"
                        self.last_pipe_time = pygame.time.get_ticks()
                        self.grace_period = 30
                        self.bird.flap()
                
                elif self.state == "PLAYING":
                    if event.key in (K_SPACE, K_UP):
                        self.bird.flap()
                
                elif self.state == "GAME_OVER":
                    if event.key in (K_SPACE, K_RETURN):
                        self.reset_game()
                        self.state = "PLAYING"
                        self.bird.flap()
            
            if event.type == MOUSEBUTTONDOWN:
                if self.state == "MENU":
                    self.state = "PLAYING"
                    self.bird.flap()
                elif self.state == "PLAYING":
                    self.bird.flap()
                elif self.state == "GAME_OVER":
                    self.reset_game()
                    self.state = "PLAYING"
                    self.bird.flap()
    
    def update(self):
        """Update game logic"""
        if self.state == "PLAYING":
            self.bird.update()
            
            current_time = pygame.time.get_ticks()
            if current_time - self.last_pipe_time > self.pipe_frequency:
                self.spawn_pipe()
                self.last_pipe_time = current_time
            
            for pipe in self.pipes:
                pipe.update()
                
                if not pipe.passed and pipe.x + pipe.width < self.bird.x:
                    pipe.passed = True
                    self.score += 1
                    self.update_difficulty()
            
            self.pipes = [p for p in self.pipes if not p.is_off_screen()]
            
            self.ground_x -= abs(self.pipe_velocity)
            ground_width = self.sprites['ground'].get_width()
            if self.ground_x <= -ground_width:
                self.ground_x = 0
            
            if self.grace_period > 0:
                self.grace_period -= 1
            elif self.check_collision():
                if self.score > self.high_score:
                    self.high_score = self.score
                self.state = "GAME_OVER"
    
    def draw(self):
        """Render the game"""
        self.screen.blit(self.sprites['background'], (0, 0))
        
        if self.state == "MENU":
            self.bird.draw(self.screen)
            
            title = self.font_large.render("FLAPPY BIRD", True, WHITE)
            title_rect = title.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT//3))
            self.screen.blit(title, title_rect)
            
            instruction = self.font.render("Press SPACE to Start", True, WHITE)
            inst_rect = instruction.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT//2))
            self.screen.blit(instruction, inst_rect)
            
            high_text = self.font.render(f"High Score: {self.high_score}", True, WHITE)
            high_rect = high_text.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT*0.65))
            self.screen.blit(high_text, high_rect)
        
        elif self.state == "PLAYING" or self.state == "GAME_OVER":
            for pipe in self.pipes:
                pipe.draw(self.screen)
            
            self.bird.draw(self.screen)
            
            score_text = self.font_large.render(str(self.score), True, WHITE)
            score_rect = score_text.get_rect(center=(SCREEN_WIDTH//2, 50))
            shadow = self.font_large.render(str(self.score), True, BLACK)
            self.screen.blit(shadow, (score_rect.x+2, score_rect.y+2))
            self.screen.blit(score_text, score_rect)
        
        if self.state == "GAME_OVER":
            overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
            overlay.set_alpha(180)
            overlay.fill(BLACK)
            self.screen.blit(overlay, (0, 0))
            
            over_text = self.font_large.render("GAME OVER", True, (255, 50, 50))
            over_rect = over_text.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT//3))
            self.screen.blit(over_text, over_rect)
            
            score_text = self.font.render(f"Score: {self.score}", True, WHITE)
            score_rect = score_text.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT//2))
            self.screen.blit(score_text, score_rect)
            
            high_text = self.font.render(f"High Score: {self.high_score}", True, (255, 215, 0))
            high_rect = high_text.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT//2 + 40))
            self.screen.blit(high_text, high_rect)
            
            diff_text = self.font.render(f"Difficulty: {self.difficulty}", True, WHITE)
            diff_rect = diff_text.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT//2 + 80))
            self.screen.blit(diff_text, diff_rect)
            
            restart = self.font.render("Press SPACE to Restart", True, WHITE)
            restart_rect = restart.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT*0.7))
            self.screen.blit(restart, restart_rect)
        
        ground_y = int(SCREEN_HEIGHT * GROUND_Y_RATIO)
        ground_width = self.sprites['ground'].get_width()
        self.screen.blit(self.sprites['ground'], (self.ground_x, ground_y))
        self.screen.blit(self.sprites['ground'], (self.ground_x + ground_width, ground_y))
        
        pygame.display.flip()
    
    def run(self):
        """Main game loop"""
        while True:
            self.handle_events()
            self.update()
            self.draw()
            self.clock.tick(FPS)



if __name__ == "__main__":
    game = Game()
    game.run()
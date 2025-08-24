import pygame
from pygame.locals import *
import HelperFunctions
class Ball:

    def __init__(self):
        self.img = pygame.image.load("Images/Saw.png")
        self.position = pygame.Vector2(500, 250)
        self.hitBox = Rect(500, 250, self.img.get_width(), self.img.get_height())
        self.BALL_SPEED = 10

    def updateRectPosition(self):
        self.hitBox.x = self.position.x
        self.hitBox.y = self.position.y

    def blitBall(self, screen):
        screen.blit(self.img, self.position)
        #self.debugDrawRect(screen)

    def debugDrawRect(self, screen):
        pygame.draw.rect(screen, (255, 0, 0), self.hitBox)

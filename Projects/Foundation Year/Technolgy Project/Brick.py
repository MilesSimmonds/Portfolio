import pygame
from pygame.locals import *

class Box:

    def __init__(self):
        self.img = pygame.image.load("Images/Box.png")
        self.position = pygame.Vector2(0, 0)
        self.hitBox = Rect(0, 0, self.img.get_width(), self.img.get_height())

    def updateRectPosition(self):
        self.hitBox.x = self.position.x
        self.hitBox.y = self.position.y

    def setPosition(self, NewPosition):
        self.position = NewPosition

    def blitBox(self, screen):
        screen.blit(self.img, self.position)
        #self.debugDrawRect(screen)

    def debugDrawRect(self, screen):
        pygame.draw.rect(screen, (255, 0, 0), self.hitBox)
# Note to students, I have written some helpful methods here. look but don't touch :)
import pygame

# Target FPS for game, change at your own risk
TARGET_FPS = 60


# Gets delta time for this frame. Delta time is the number of fractional seconds since last update.
def GetDeltaTime(clock):
    return clock.tick(60) * 0.001


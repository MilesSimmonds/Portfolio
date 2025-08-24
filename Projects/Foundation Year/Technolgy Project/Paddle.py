#
# Import the pygame module

import pygame
import HelperFunctions
import Brick
import random
import PowerUp
import Saw

#Constants for Screen Width and Height
SCREEN_WIDTH = 1200
SCREEN_HEIGHT = 600

#CONSTANTS FOR SCREEN BOUNDARIES
LEFT_BOUNDARY = 0
RIGHT_BOUNDARY = 945

#SCREEN BOUNDARIES
TOP_SCREEN_BOUNDARY = pygame.Rect(-1,2, SCREEN_WIDTH, 2)
LEFT_SCREEN_BOUNDARY = pygame.Rect(0, 0, 1,SCREEN_HEIGHT)
RIGHT_SCREEN_BOUNDARY = pygame.Rect(1200, 0, 1,SCREEN_HEIGHT)
BOTTOM_SCREEN_BOUNDARY = pygame.Rect(0,600,SCREEN_WIDTH,1)

#PADDLE CONSTANTS
PADDLE_SPEED = 11


def main():
    # initialize pygame module for use
    pygame.init()
    #Setup the screen size, width and height
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))

    # Game loop variables
    clock = pygame.time.Clock()
    deltatime = 0
    isRunning = True

    # VARIABLES
    #BALL VARIABLES
    SAWSPEED = 600
    RandomSpeed = random.randint(SAWSPEED, 800)
    Ball = Saw.Ball()

    ballspeed = pygame.Vector2(0, SAWSPEED)

    ballbounce_vertical = random.randint(600, 800)

    #PADDLE VARIABLES
    Paddleposition = pygame.Vector2(480, 570)

    PlayerScore = 0


    #BOX VARIABLES
    Box1 = Brick.Box()
    Box1.setPosition(pygame.Vector2(0, 0))

    Box2 = Brick.Box()
    Box2.setPosition(pygame.Vector2(150, 0))
    Box2.updateRectPosition()

    Box3 = Brick.Box()
    Box3.setPosition(pygame.Vector2(300, 0))
    Box3.updateRectPosition()


    Box4 = Brick.Box()
    Box4.setPosition(pygame.Vector2(450, 0))
    Box4.updateRectPosition()


    Box5 = Brick.Box()
    Box5.setPosition(pygame.Vector2(600, 0))
    Box5.updateRectPosition()

    Box6 = Brick.Box()
    Box6.setPosition(pygame.Vector2(750, 0))
    Box6.updateRectPosition()

    Box7 = Brick.Box()
    Box7.setPosition(pygame.Vector2(900, 0))
    Box7.updateRectPosition()

    Box8 = Brick.Box()
    Box8.setPosition(pygame.Vector2(1050, 0))
    Box8.updateRectPosition()

    #LIST OF BOXES
    Boxes = [Box1,Box2,Box3,Box4,Box5,Box6,Box7,Box8]

    #GAME_STATES
    bisMainMenu = True
    bIsGamePlay = False
    bisGameOver = False
    bisGameWon = False

    #POWERUP_VARIABLES
    Bomb = PowerUp.Powerup()
    Bombchance = 0
    Bombspeed = pygame.Vector2(0, 400)
    BombList = []

    # Load images here
    PaddleImage = pygame.image.load("Images/Paddle.png")
    BackgroundImage = pygame.image.load("Images/Background.png")

    #FONTS
    Scorefont = pygame.font.Font("Fonts/Oswald", 20)
    mainmenufont = pygame.font.Font("Fonts/Oswald", 110)
    # Load sounds here
    SawHit_Sound = pygame.mixer.Sound("Sounds/MetalBONK.wav")
    Death_sound =  pygame.mixer.Sound("Sounds/gameendsound.wav")
    Win_sound = pygame.mixer.Sound("Sounds/cheer.mp3")

    # Main game loop
    while isRunning:
        deltatime = HelperFunctions.GetDeltaTime(clock)

        # Event handlers, processes pygame events
        for event in pygame.event.get():
            # If the event is QUIT
            if event.type == pygame.QUIT:
                # Quit the game
                isRunning = False

        if bisMainMenu == True:
            #main menu code

            keys = pygame.key.get_pressed()
            if keys[pygame.K_RETURN]:
                bisMainMenu = False
                bIsGamePlay = True
                SAWSPEED = 600
                Ball = Saw.Ball()
                ballspeed = pygame.Vector2(0, SAWSPEED)
                Boxes = [Box1, Box2, Box3, Box4, Box5, Box6, Box7, Box8]
                PlayerScore = 0
                #PADDLE VARIABLES
                Paddleposition = pygame.Vector2(480, 570)
                for bomb in BombList:
                    BombList.remove(bomb)

            screen.fill("black")

            MenuText = mainmenufont.render("A R K A N O I D", True, (255 ,255 ,255))
            screen.blit(MenuText, (SCREEN_WIDTH/4, 200))

            pygame.display.update()

        if bIsGamePlay == True:

            # Update logic goes here
            Bombchance = 0

            Ball.position += ballspeed * deltatime
            ballbounce_horizontal = random.randint(-550, 550)
            ballbouncestraght = pygame.Vector2(0, -SAWSPEED)
            PlayerScore += 0 + deltatime

            # Key Controls
            # Moving Left
            keys = pygame.key.get_pressed()
            if keys[pygame.K_LEFT] and Paddleposition.x > LEFT_BOUNDARY:
                Paddleposition += pygame.Vector2(-PADDLE_SPEED, 0)
            # Moving Right
            if keys[pygame.K_RIGHT] and Paddleposition.x <= RIGHT_BOUNDARY:
                Paddleposition += pygame.Vector2(PADDLE_SPEED, 0)

            #HITBOXES
            PaddleHitBox = pygame.Rect(Paddleposition, (PaddleImage.get_width(), PaddleImage.get_height()))

            #BALL LOGIC

            #BOUNCE OF PADDLE
            if Ball.hitBox.colliderect(PaddleHitBox):
                Ball.position += ballbouncestraght * deltatime
                ballspeed = pygame.Vector2(0, 0)
                ballspeed = pygame.Vector2(-ballbounce_horizontal, -SAWSPEED)


            #TOP BOUNDARY
            if Ball.hitBox.colliderect(TOP_SCREEN_BOUNDARY):
                ballspeed = pygame.Vector2(0, 0)
                ballspeed = pygame.Vector2(ballbounce_horizontal, RandomSpeed)

            #LEFT BOUNDARY
            if Ball.hitBox.colliderect(LEFT_SCREEN_BOUNDARY):
                ballspeed = pygame.Vector2(0, 0)
                ballspeed = pygame.Vector2(SAWSPEED, -ballbounce_vertical)

            #RIGHT BOUNDARY
            if Ball.hitBox.colliderect(RIGHT_SCREEN_BOUNDARY):
                ballspeed = pygame.Vector2(0, 0)
                ballspeed = pygame.Vector2(-SAWSPEED, ballbounce_vertical)

            #BOTTOM BOUNDARY
            if Ball.hitBox.colliderect(BOTTOM_SCREEN_BOUNDARY):
                pygame.mixer.Sound.play(Death_sound)

                bIsGamePlay = False
                bisGameOver = True

            #BOUNCE OFF BOX
            for Box in Boxes:
             if Ball.hitBox.colliderect(Box.hitBox):
                 pygame.mixer.Sound.play(SawHit_Sound)
                 Boxes.remove(Box)
                 ballspeed = pygame.Vector2(0, 0)
                 ballspeed = pygame.Vector2(0, SAWSPEED)

                 Bombchance = random.randint(1,6)
                 #Bombchance = 2

                #SPAWN THE BOMB
                 if Bombchance == 2:
                    bomb = PowerUp.Powerup()
                    bomb.position += Box.position
                    BombList.append(bomb)


            #BOMBLOGIC

            Ball.updateRectPosition()
            Bomb.updateRectPosition()

            for bomb in BombList:
                if bomb.hitBox.colliderect(PaddleHitBox):
                    bIsGamePlay = False
                    bisGameOver = True
                    pygame.mixer.Sound.play(Death_sound)

            # MAKE BOMB MOVE
            for bomb in BombList:
                bomb.position += Bombspeed * deltatime


            if Boxes == [ ]:
                pygame.mixer.Sound.play(Win_sound)

                bIsGamePlay = False
                bisGameWon = True

            # DRAW LOGIC GOES HERE
            #Prints the background
            screen.blit((BackgroundImage), (0,-SAWSPEED))

            #PRINTS BOXES
            for Box in Boxes:
                Box.blitBox(screen)

            #PRINTS BOMB
            for Bomb in BombList:
                Bomb.blitBomb(screen)

            # Prints Paddle
            screen.blit((PaddleImage), Paddleposition)

            # Prints Ball
            Ball.blitBall(screen)



            # draw text to screen.

            ScoreText = Scorefont.render("Score: " + (str(int(PlayerScore))),True,(255 ,255 ,255))
            screen.blit(ScoreText, (10,420))

            # DEBUG FOR HITBOX
            #pygame.draw.rect(screen, (255,0,0), PaddleHitBox)

            pygame.display.update()

        if bisGameOver == True:
            # Game Over Screen
            keys = pygame.key.get_pressed()
            if keys[pygame.K_SPACE] == True:
                bisGameOver = False
                bisMainMenu = True

            screen.fill("black")

            MenuText = mainmenufont.render("G A M E  O V E R !", True, (155, 0, 0))
            screen.blit(MenuText, (SCREEN_WIDTH / 4, 200))

            pygame.display.update()

        if bisGameWon == True:
            # Game won screen
            keys = pygame.key.get_pressed()
            if keys[pygame.K_SPACE] == True:
                bisGameWon = False
                bisMainMenu = True
            #when the game is won reset the bomb list
            for bomb in BombList:
                BombList.remove(bomb)
                bomb.updateRectPosition()


            screen.fill("white")

            MenuText = mainmenufont.render("Y O U  W O N ! ! !", True, (0 ,0 ,0))
            screen.blit(MenuText, (SCREEN_WIDTH/3.8, 200))
            FinalScore = Scorefont.render("Score: " + (str(int(PlayerScore))),True,(255 ,0 ,0))
            ScoreInfo = Scorefont.render("(The lower your score the better)", True,(255,0,0))
            screen.blit(FinalScore, (580, 420))
            screen.blit(ScoreInfo, (525, 455))
            pygame.display.update()



# calls main when file is run
if __name__=="__main__":
    main()

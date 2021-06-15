
import time
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522

# Create an object of the class MFRC522
# reader = SimpleMFRC522()
# testwaarde = 0

class RFIDclass():
    def __init__(self):
        self.reader = SimpleMFRC522()

        
    def rfidloop(self): 
            try:
                while True:
                    print("Hold a tag near the reader")

                    # test = 'test'
                    # reader.write(test)

                    print("Hold a tag near the reader")
                    id, text = self.reader.read()
                    print("ID: %s\nText: %s" % (id, text))

                    # text = 'yeet'
                    # print('place tag')
                    # reader.write(text)
                    # test = reader.read_id()

                    # print(test)
                    # id, text = reader.read()
                    # print(id)
                    # print(text)
                    time.sleep(1)

                # print('written')
                    # if testwaarde == 0:
                    #   testwaarde =1
                    # else:
                    #   testwaarde = 0

                    # print(testwaarde)


            except KeyboardInterrupt:
                GPIO.cleanup()


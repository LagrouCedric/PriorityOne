# from Code.Backend.repositories.Database import Database
import sys
from subprocess import call
from mfrc522 import SimpleMFRC522
from flask import Flask, render_template, request, redirect, url_for, session
from subprocess import check_output
import adafruit_ssd1306
from PIL import Image, ImageDraw, ImageFont
import digitalio
import board
from datetime import datetime
from termios import ECHO

from mfrc522.SimpleMFRC522 import SimpleMFRC522
from repositories.DataRepository import Database
from serial import Serial, PARITY_NONE
import time
from RPi import GPIO
# from helpers.klasseknop import Button
# from helpers.rfidtestfile2 import RFIDclass
import threading
from flask_cors import CORS
from flask import Flask, json, jsonify
from flask_socketio import SocketIO, emit, send
from repositories.DataRepository import DataRepository
# bij opstarten pi, het alarm uitzetten
DataRepository.state_alarm(0, 0, 'Alarm uitzetten, initialisatie alarm')
global alarmtijd
global temptijd
global SireneTest
SireneTest = False
alarmtijd = datetime.now()
temptijd = time.time()
# Code voor Hardware
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
endpoint = '/api/v1'
global alarmState
global trigger
global Alarmtrigger
# alarmtrigger None, er is niets gebeurt, dus is er geen info om weer te geven
# ook de alarmstate & trigger op false
Alarmtrigger = "None"
trigger = False
alarmState = False

# functie die de MQ2 waarde inleest en doorstuurt naar de database


def gasfunctie(line):
    # global line
    if line[len(line)-3:] == 'mqw':
        # print(f'waarde mq doorsturen naar database')
        mqwaarde = line[:len(line)-3]
        print(f'mqwaarde is {mqwaarde}')
        mq = int(mqwaarde)
        DataRepository.sens_to_database(0, 4, mq, 'Value CO, lower is better')

# functie die temp inleest via one wire bus en dan de temp doorstuurt naar de database


def tempfunctie(sensor_file_name='/sys/bus/w1/devices/28-03179779cd02/w1_slave'):
    try:
        sensor_file = open(sensor_file_name, 'r')
        bestand = sensor_file.read()
        temp = bestand[-6:-4] + "." + bestand[-4:-3]
        # print(f"De temperatuur is {temp} °Celsius")
        DataRepository.sens_to_database(0, 1, temp, 'House temperature')
        socketio.emit('B2FSensoren', jsonify(
            sensoren=DataRepository.read_sensoren()))

    except:
        # print('try failed for temp')
        pass

# functie die alle nodige emits doorstuurd die de site dan kan ontvangen om data uit te halen


def verstuur_emits():

    status = DataRepository.read_sensoren()
    socketio.emit('B2FSensoren', {'sensoren': status}, broadcast=True)
    alarmstate = DataRepository.read_state_device(3)
    time.sleep(0.05)

    socketio.emit('B2Falarm', {'alarm': alarmstate}, broadcast=True)
    time.sleep(0.05)
    alarmhistoriek = DataRepository.read_alarm()
    socketio.emit('B2Falarmhistoriek', {
                  'sensoren': alarmhistoriek}, broadcast=True)
    time.sleep(0.05)

    temp = DataRepository.read_state_device(1)
    socketio.emit('B2Ftemp', {'temp': temp}, broadcast=True)
    gas = DataRepository.read_state_device(4)
    socketio.emit('B2Fgas', {'gas': gas}, broadcast=True)

    global Alarmtrigger
    socketio.emit('B2FTrigger', {'trigger': Alarmtrigger}, broadcast=True)


# def lees_knop(pin):
#     global alarmState
#     global trigger
#     print("**** button pressed ****")
#     if alarmState == False:
#         print('alarm aan')
#         alarmState = True
#         DataRepository.state_alarm(1, 0, 'alarm aan')
#         # switch_light({'lamp_id': '3', 'new_status': 0})

#     else:
#         print('alarm uit')
#         alarmState = False
#         trigger = False
#         DataRepository.state_alarm(0, 1, 'alarm uit')

#         # switch_light({'lamp_id': '3', 'new_status': 1})
#     verstuur_emits()


# knop1.on_press(lees_knop)
# GPIO.add_event_detect(knop, GPIO.FALLING, lees_knop, 300)

# Code voor Flask

app = Flask(__name__)
app.config['SECRET_KEY'] = 'geheim!'
socketio = SocketIO(app, cors_allowed_origins="*", logger=False,
                    engineio_logger=False, ping_timeout=1)

CORS(app)


@socketio.on_error()        # Handles the default namespace
def error_handler(e):
    print(e)


# START een thread op. Belangrijk!!! Debugging moet UIT staan op start van de server, anders start de thread dubbel op
# werk enkel met de packages gevent en gevent-websocket.


# OLED configuratie
oled_reset = digitalio.DigitalInOut(board.D22)
WIDTH = 128
HEIGHT = 64
BORDER = 5
global i2c
global oled
i2c = board.I2C()
oled = adafruit_ssd1306.SSD1306_I2C(
    WIDTH, HEIGHT, i2c, addr=0x3C, reset=oled_reset)

# functie om state van het alarm te veranderen met de RFID tag


def change_alarm_state():
    alarmstate = DataRepository.read_state_device(3)
    # if alarmstate['NewValue'] == 1 or alarmstate['NewValue'] == 2:

    #     global alarmuitstate
    #     alarmuitstate = True

    # elif alarmstate['NewValue'] == 0 :

    #     global alarmaan
    #     alarmaan = 1
    # alarmstate = DataRepository.read_state_device(3)
    global alarmState

    if alarmstate['NewValue'] == 0:
        DataRepository.state_alarm(1, 0, 'Change state alarm with RFID tag')
        oled(ip, 'alarm active', '', '')
        alarmState = 1
        global alarmaan
        alarmaan = 1

        print('alarm aan via site')

    else:
        DataRepository.state_alarm(0, 1, 'Change state Alarm with RFID tag')
        oled(ip, 'alarm inactive', '', '')
        alarmState = 0
        print('alarm uit via rfid')
        global trigger
        trigger = False
        global alarmuitstate
        alarmuitstate = True

    verstuur_emits()


# functie om errormessages te controleren en aan de hand daarvan de juiste info geven aan de eindgebruiker


def errorcontrole(line):
    global ip
    global trigger
    global Alarmtrigger
    global alarmtijd
    delay = 10
    if line[len(line)-3:] == 'eha':
        print('hall sensor trigger')

        DataRepository.sens_to_database(0, 2, 1, 'trigger front door sensor')
        if trigger == False:
            alarmtijd = time.time() + delay
        trigger = True
        Alarmtrigger = 'Front door open'
        oled(ip, 'Alarm triggered', Alarmtrigger, '')

        # now = datetime.now()

        # alarmtijd = now.strftime("%H:%M:%S")

    elif line[len(line)-3:] == 'emq':
        print('MQ sens getriggerd')
        Alarmtrigger = 'CO-value high'
        oled(ip, 'Alarm triggered', Alarmtrigger, '')
        DataRepository.sens_to_database(0, 4, 1, 'Co Value too high')
        if trigger == False:
            alarmtijd = time.time() + delay
        trigger = True

    elif line[len(line)-3:] == 'eir':
        print('IR sens getriggerd')
        Alarmtrigger = 'Movement in living room'
        oled(ip, 'Alarm triggered', Alarmtrigger, '')
        DataRepository.sens_to_database(
            0, 6, 1, 'movement detected in living room')
        if trigger == False:
            alarmtijd = time.time() + delay
        trigger = True

    elif line[len(line)-3:] == 'eus':
        print('Us sens getriggerd')
        Alarmtrigger = 'Movement in hall'
        oled(ip, 'Alarm triggered', Alarmtrigger, '')
        DataRepository.sens_to_database(0, 5, 1, 'movement detected in hall')
        if trigger == False:
            alarmtijd = time.time() + delay
        trigger = True

    # elif line[len(line)-3:] == 'afs':
    #     afst = len(line) - 3
    #     print(f'afst = {afst}')
    #     afstand = line[:afst]
    #     print(f'afstand is: {afstand}')

    else:
        # print('error pass')
        pass

# functie om 4 lijnen tekst weer te geven op de OLED display


def ipfunctie():
    global ip
    ips = check_output(['hostname', "-I"])
    # print(f'-I : {ips}')
    # ip inlezen
    ip = ips[15:30]
    ip = ip.decode('utf-8')


def oled(lijn1, lijn2, lijn3, lijn4):
    oled_reset = digitalio.DigitalInOut(board.D22)

    WIDTH = 128
    HEIGHT = 64  # Change to 64 if needed
    BORDER = 5

    # Use for I2C.

    i2c = board.I2C()
    oled = adafruit_ssd1306.SSD1306_I2C(
        WIDTH, HEIGHT, i2c, addr=0x3C, reset=oled_reset)

    oled.fill(0)
    oled.show()

    image = Image.new("1", (oled.width, oled.height))

    draw = ImageDraw.Draw(image)
    font = ImageFont.load_default()

    draw.text((1, 1), lijn1, font=font, fill=255)
    draw.text((3, 16), lijn2, font=font, fill=255)
    draw.text((3, 26), lijn3, font=font, fill=255)
    draw.text((3, 36), lijn4, font=font, fill=255)
    # (font_width, font_height) = font.getsize(text)
    oled.image(image)
    oled.show()

# main loop


def loop():
    with Serial('/dev/ttyUSB0', 115200, bytesize=8, parity=PARITY_NONE, stopbits=1) as port:
        ipfunctie
        global line
        global alarmuitstate
        global alarmaan
        global sireneState
        global trigger
        trigger = 0
        sireneState = 0
        alarmaan = 0
        alarmuitstate = False
        line = ""
        ips = check_output(['hostname', "-I"])
        # print(f'-I : {ips}')
        # ip inlezen
        ip = ips[15:30]
        ip = ip.decode('utf-8')
        # ips = check_output(['hostname', '--all-ip-addresses'])
        # print(f'all ip : {ips}')

        port.write("alarmuit".encode(encoding='UTF-8'))
        oled(ip, 'alarm inactive', '', '')

        while True:
            ipfunctie()
            

            line = ""
            # kijken of arduino iets doorstuurd
            if port.inWaiting() > 0:
                line = port.readline().decode(encoding='UTF-8').rstrip()
                # print('arduino stuurde:')
                # print(line)
                # print('lijn - 3:')
                # print(line[len(line)-3:])

            # port.write("alarmaan".encode(encoding='UTF-8'))
            global Alarmtrigger
            global alarmtijd
            global alarmState
            # if alarmaan == 0 and inactiveState == 1:
            #     oled(ip, 'alarm inactive', '', '')
            #     inactiveState = 0
            global SireneTest
            global alarmtest
            if SireneTest == True:
                if alarmtest == True:
                    print('sirenetest')
                    oled(ip, 'Alarm testing', Alarmtrigger, '')
                    DataRepository.state_alarm(3, 0, 'Testing Alarm')
                    port.write("sirene".encode(encoding='UTF-8'))
                    alarmtest = False

                    testtimer = time.time() + 10
                if testtimer < time.time():
                    SireneTest = False
                    port.write("alarmuit".encode(encoding='UTF-8'))
                    oled(ip, 'alarm inactive', '', '')
                    DataRepository.state_alarm(0, 3, 'Testing Alarm done')

            else:
                # als het alarm geactiveerd wordt doorsturen naar de arduino dat de status van het alarm aan is en ook weergeven op OLED display
                if alarmaan == 1:
                    inactiveState = 1
                    port.write("alarmaan".encode(encoding='UTF-8'))
                    oled(ip, 'alarm active', '', '')

                    time.sleep(1)
                    print('doorsturen arduino dat alarm aan ligt')

                    alarmaan = 0
                # print('loop start')
                # hulpfuncties oproepen
                gasfunctie(line)
                errorcontrole(line)

                # als het alarm gedeactiveerd wordt weergeven op oled en doorsturen naar arduino
                if trigger == False and alarmuitstate == True:
                    oled(ip, 'alarm inactive', '', '')
                    print('alarm uitzetten')
                    Alarmtrigger = "None"
                    sireneState = 0
                    alarmuitstate = False
                    port.write("alarmuit".encode(encoding='UTF-8'))
                # als het alarm afgaat, doorsturen naar arduino, weergeven op oled en doorsturen naar de database

                if trigger == True and alarmtijd < time.time() and alarmState == True:
                    if sireneState == 0:

                        print('alarm gaat af')
                        print(Alarmtrigger)
                        oled(ip, 'Alarm triggered', Alarmtrigger, '')

                        DataRepository.state_alarm(2, 1, 'Sirene gaat af')
                        port.write("sirene".encode(encoding='UTF-8'))
                        print('duursturen naar arduino dat alarm afgaat')
                        sireneState = 1

                    # actuator nog doorsturen naar database, tonen op site dat de sirene afgaat, maken via site te knn afleggen via de knop alarm af en fysiek ook afleggen via rfid

                    # if 'e' in line[len(line)-3:]:
                    # print('alarm getriggerd functie aanspreken ')#30 seconden voor alarm afgaat, indien de state van het alarm dan nog steeds True is
                    # print('inde try except loop')

                    # print('error line=')
                    # print(line)

            # # print('doorsturen naar arduino: aanvraag afstand')
            # # print('we lezen data in')

                # except Exception as e:
                    # print(e)
            #     # port.write('alarmaan'.encode(encoding='UTF-8'))
            #     # print('afstand opvraggen')

            # emits versturen om de data up to date te houden
            verstuur_emits()

            # time.sleep(60)



def looptemp():
    with app.app_context():
        while True:
            global temptijd
            # print(temptijd)
            # print('temp loop yeye')
            if time.time() >= temptijd:
                # print('tempfuncite')
                tempfunctie()
                temptijd = time.time() + 90

            time.sleep(2)


def threaded_rfid():
    reader = SimpleMFRC522()
    try:
        while True:
            print('hold tag near reader')
            id, text = reader.read()
            print("ID: %s\nText: %s" % (id, text))
            change_alarm_state()
            time.sleep(5)
    except KeyboardInterrupt:
        GPIO.cleanup()
        raise


x = threading.Thread(target=threaded_rfid)
x.start()
# rfidloop = threading.Thread(target=rfid)
# rfidloop.start()
thread = threading.Timer(3, loop)
thread.start()
temploop = threading.Timer(1, looptemp)
temploop.start()


print("**** Program started ****")

# API ENDPOINTS

@app.route('/')
def hallo():
    return "Server is running, er zijn momenteel geen API endpoints beschikbaar."

# alarmstate via site veranderen


@socketio.on('F2BPincode')
def pincode():
    data = DataRepository.get_pincode()
    socketio.emit('B2FPincode', {'pincode': data})


@socketio.on('F2BChangePin')
def change_pin(json):
    # pin = json['pin']
    # print('pinchange')
    print(pin)
    DataRepository.change_pincode(pin)
    time.sleep(0.05)
    pincode()


@socketio.on('F2BShutdown')
def shutdown():
    global ip
    print('shutdown')
    oled(ip, "shutdown", "", "")
    call("sudo poweroff", shell=True)


@socketio.on('F2BveranderAlarm')
def change_alarm(json):
    print('state alarm veranderen via site')
    print(json)
    prevstate = int(json['alarm'])
    if prevstate == 0:
        newstate = 1
    else:
        newstate = 0
    DataRepository.state_alarm(
        newstate, prevstate, 'verandering state alarm via site')

    global alarmState
    alarmstate = DataRepository.read_state_device(3)

    if alarmstate['NewValue'] == 1:
        alarmState = 1
        global alarmaan
        alarmaan = 1

        print('alarm aan via site')
    else:
        alarmState = 0
        print('alarm uit via site')
        global trigger
        trigger = False
        global alarmuitstate
        alarmuitstate = True
    verstuur_emits()

# @socketio.on('F2BTemp')
# def get_temp():
#     print('temp ophalen en naar site sturen')

# sensor data opvragen


@socketio.on('F2BTestAan')
def testaan():
    global SireneTest

    SireneTest = True
    global alarmtest
    alarmtest = True


@socketio.on('F2BSensoren')
def Get_sensors():
    data = DataRepository.read_sensoren()
    verstuur_emits()

# devicedata opvragen


@socketio.on('RFID')
def rfid(value):
    print('rfid stuurde door')
    print(value)


@socketio.on('F2BDevice')
def stuur_devices():
    # print('data')
    data = DataRepository.read_devices()
    # print(data)
    socketio.emit('B2FDevice', {'device': data}, broadcast=True)


@socketio.on('F2Bshowdevice')
def info(id):
    # print(f'id is {id}')
    idwaarde = id['id']
    # print(idwaarde)
    id = int(idwaarde)
    data = DataRepository.read_sensor(id)

    socketio.emit('B2FDeviceInfo', {'info': data})

# connection met socketio


@socketio.on('connect')
def initial_connection():
    print('A new client connect')
    # # Send to the client!
    verstuur_emits()

    # vraag de status op van de lampen uit de DB
    # status = DataRepository.read_status_lampen()
    # emit('B2F_status_lampen', {'lampen': status}, broadcast=True)


# @socketio.on('F2B_switch_light')
# def switch_light(data):
#     # Ophalen van de data
#     lamp_id = data['lamp_id']
#     new_status = data['new_status']
#     print(f"Lamp {lamp_id} wordt geswitcht naar {new_status}")

#     # Stel de status in op de DB
#     res = DataRepository.update_status_lamp(lamp_id, new_status)

#     # Vraag de (nieuwe) status op van de lamp en stuur deze naar de frontend.
#     data = DataRepository.read_status_lamp_by_id(lamp_id)
#     socketio.emit('B2F_verandering_lamp', {'lamp': data}, broadcast=True)

#     # Indien het om de lamp van de TV kamer gaat, dan moeten we ook de hardware aansturen.
#     if lamp_id == '3':
#         print(f"TV kamer moet switchen naar {new_status} !")
#         GPIO.output(led3, new_status)

# ANDERE FUNCTIES

if __name__ == '__main__':
    socketio.run(app, debug=False, host='0.0.0.0')

# def login():
#     # Output message if something goes wrong...
#     msg = ''
#     # Check if "username" and "password" POST requests exist (user submitted form)
#     if request.method == 'POST' and 'username' in request.form and 'password' in request.form:
#         # Create variables for easy access
#         username = request.form['username']
#         password = request.form['password']
#         # Check if account exists using MySQL
#         print(username)
#         print(password)
#         cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
#         cursor.execute('SELECT * FROM accounts WHERE username = %s AND password = %s', (username, password,))
#         # Fetch one record and return result
#         account = cursor.fetchone()
#         # If account exists in accounts table in out database
#         if account:
#             # Create session data, we can access this data in other routes
#             session['loggedin'] = True
#             session['id'] = account['id']
#             session['username'] = account['username']
#             # Redirect to home page
#             return 'Logged in successfully!'
#         else:
#             # Account doesnt exist or username/password incorrect
#             msg = 'Incorrect username/password!'
#     # Show the login form with message (if any)
#     return render_template('Home.html', msg=msg)

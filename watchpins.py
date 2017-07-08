#!/usr/bin/python
# watchpins.py - listen for and log GPIO input changes using interrupts
# implementation note: why is this Python not Node? see same reasons in https://github.com/rxseger/homebridge-pwm-fan/blob/master/pwmfanhelper.py and TODO: fix

import RPi.GPIO as GPIO
import sys
import time
import threading

GPIO.setmode(GPIO.BOARD)

switches = map(int, sys.argv[1:])
if len(switches) == 0:
	sys.stderr.write("""usage: %s [physical pin(s) to watch]

example: %s 24 26 22

When an input changes state (rising or falling, on interrupt), this
program will log, once per line, the pin, a space, and the new state.
""" % (sys.argv[0], sys.argv[0]))
	raise SystemExit

GPIO.setwarnings(False)
GPIO.setup(switches, GPIO.IN, pull_up_down=GPIO.PUD_UP)

write_lock = threading.Lock()

def handle(pin):
	state = GPIO.input(pin)

	write_lock.acquire()
	sys.stdout.write('%s %s\n' % (pin, state))
	sys.stdout.flush()
	write_lock.release()

# trigger for all on both rising and falling edges
for pin in switches:
	GPIO.add_event_detect(pin, GPIO.BOTH, handle)

GPIO.setup(switches, GPIO.OUT)
GPIO.output(switches, GPIO.LOW)
GPIO.setup(switches, GPIO.IN, pull_up_down=GPIO.PUD_UP)


while True: time.sleep(1e6)

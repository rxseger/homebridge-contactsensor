#!/usr/bin/python
# watchpins.py - listen for and log GPIO input changes using interrupts

import RPi.GPIO as GPIO
import sys
import time

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

def handle(pin):
	state = GPIO.input(pin)
	# TODO: sync writing to output to avoid clobbering others!
	print pin,state

# trigger for all on both rising and falling edges
for pin in switches:
	GPIO.add_event_detect(pin, GPIO.BOTH, handle)

while True: time.sleep(1e6)

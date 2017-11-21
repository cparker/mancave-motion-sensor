#!/usr/bin/env node

const gpio = require('rpi-gpio')
const { exec } = require('child_process')
const process = require('process')

const motionPin = process.env.MOTION_PIN || 14

let lastMotionTimestamp = (new Date()).getTime()

gpio.setMode(gpio.MODE_BCM)
gpio.setup(motionPin, gpio.DIR_IN, gpio.EDGE_RISING)

gpio.on('change', function(channel, value) {
	console.log(`motion state changed, value ${value}`)
	if (value) {
		lastMotionTimestamp = (new Date()).getTime()
	}
})



#!/usr/bin/env node

'use strict'

const process = require('process')
const express = require('express')
const port = process.env.PORT || 5000
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const gpio = require('rpi-gpio')
const { exec } = require('child_process')
const mqtt = require('mqtt')

const motionPin = process.env.MOTION_PIN || 14
const MQTT_HOST = process.env.MQTT_HOST || 'mqtt://192.168.1.210'
const mqttClient = mqtt.connect(MQTT_HOST)
const studioOffAfterNoMotionMS = process.env.STUDIO_OFF_AFTER_NO_MOTION_MS || 60 * 60 * 1000

let lastMotionTimestamp = (new Date()).getTime()

gpio.setMode(gpio.MODE_BCM)
gpio.setup(motionPin, gpio.DIR_IN, gpio.EDGE_RISING)


app.use(cookieParser())
app.use(express.static(__dirname + '/node_modules'))
app.use(express.static('.'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
	extended: true
}))

io.on('connection', client => {
	console.log('headers', client.handshake.headers)
})

gpio.on('change', function(channel, value) {
	console.log(`motion state changed, value ${value}`)
	io.clients( (error, clients) => {
		clients.forEach( c => {
			console.log(c)
			io.sockets.connected[c].emit('motion', {})
		})
	})
	if (value) {
		lastMotionTimestamp = (new Date()).getTime()
	}
})

// check every 30 seconds
setInterval(() => {
	// io.clients( (error, clients) => {
	// 	console.log('we have clients', clients)
	// })
	let now = (new Date()).getTime()

	// send studio off after no motion timeout
	if (now - lastMotionTimestamp > studioOffAfterNoMotionMS) {
		mqttClient.publish('hass/studio_off', '')
	}

}, 30000)

server.listen(port, '0.0.0.0', () => {
	console.log(`listening on ${port}`)
})


# Pi Display

This repository contains the source code for the interface for one of projects named Pi Display. Pi Display provides a simplistic touchscreen interface for viewing Spotify now playing and for controlling Phillips Hue lighting.

## Details

The interface was designed to work on a display with an aspect ratio of 4.63 and is composed of a Vite React App that interfaces with the [Spotify Web API](https://developer.spotify.com/documentation/web-api/) and [Phillips Hue Bridge API (Unofficial Documentation)](https://www.burgestrand.se/hue-api/).

The app runs in the Chromium browser that comes pre-installed with [Raspberry Pi OS](https://www.raspberrypi.com/software/) and runs in kiosk mode on boot up to provide a seamless experience.

### Spotify

The app polls the Spotify API once every second to provide live updates but pauses when the user is interacting with the display to prevent race-like conditions.

### Hue

The app, similarly, polls the Hue API at a regular interval and it too has a temporary pause.

### Hardware

- The screen is a [WaveShare 11.9" Capacitive Touch DSI Screen](https://www.waveshare.com/11.9inch-hdmi-lcd.htm).
- The app runs on a [Raspberry Pi 3 Model B](https://www.raspberrypi.com/products/raspberry-pi-3-model-b/).

## Photos

### Spotify

![Spotify](https://i.imgur.com/OCayhGG.png)

### Phillips Hue

![Spotify](https://i.imgur.com/8E1mXqi.png)

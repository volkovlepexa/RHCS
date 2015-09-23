#!/bin/sh

## Команда для запуска стриминга с веб-камеры
## input_uvc: /dev/video0; 25 FPS; JPEG quality: 0.5; Resolution: 1280x720
## output_http: Static webdir: /usr/local/mjpg_www; Port: 8085; Password: none
## Когда-нибудь я пересоберу нормальный пакет mjpg_streamer, без ошибки с версионированием в apt.

mjpg_streamer -i "input_uvc.so -d /dev/video0 -y -f 25 -q 50 -r 1280x720" -o "output_http.so -w /usr/local/mjpg_www -p 8085"

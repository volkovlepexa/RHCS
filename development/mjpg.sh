#!/bin/sh
mjpg_streamer -i "input_uvc.so -d /dev/video0 -y -f 20 -r 640x480" -o "output_http.so -w /usr/local/mjpg_www -p 8085"

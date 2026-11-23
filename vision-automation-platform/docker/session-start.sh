#!/bin/bash
set -e
Xvfb "$DISPLAY" -screen 0 "$RESOLUTION" -nolisten tcp &
sleep 1
dbus-launch startxfce4 >/tmp/xfce.log 2>&1 &
# VNC is localhost-only; noVNC is the sole exposed port and is meant to sit behind the platform's authenticated proxy.
x11vnc -display "$DISPLAY" -localhost -nopw -forever -shared -rfbport 5900 -quiet &
exec websockify --web /usr/share/novnc 6080 localhost:5900

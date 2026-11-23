# One isolated Linux desktop per automation session. Real X server + real XFCE desktop; the agent only sees
# pixels (ImageMagick `import`) and acts with real X input events (xdotool). noVNC lets the user watch and
# take over from the browser (OTP/CAPTCHA/login). NOT BUILT OR TESTED YET - needs a Docker daemon.
FROM debian:bookworm-slim
ENV DEBIAN_FRONTEND=noninteractive DISPLAY=:1 RESOLUTION=1280x800x24
RUN apt-get update && apt-get install -y --no-install-recommends \
      xvfb xfce4 xfce4-terminal dbus-x11 x11vnc novnc websockify xdotool imagemagick \
      firefox-esr fonts-liberation ca-certificates procps \
    && rm -rf /var/lib/apt/lists/*
RUN useradd -m -s /bin/bash agent
USER agent
WORKDIR /home/agent
COPY --chown=agent docker/session-start.sh /home/agent/start.sh
EXPOSE 6080
CMD ["bash", "/home/agent/start.sh"]

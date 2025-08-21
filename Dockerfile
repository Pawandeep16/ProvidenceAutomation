# -----------------------------
# Base image
# -----------------------------
FROM node:20-bullseye

# -----------------------------
# Set working directory
# -----------------------------
WORKDIR /app

# -----------------------------
# Install necessary tools
# -----------------------------
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    wget \
    unzip \
    curl \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    apt install -y ./google-chrome-stable_current_amd64.deb && \
    rm google-chrome-stable_current_amd64.deb

# Install Chromedriver matching Chrome
RUN wget -q https://storage.googleapis.com/chrome-for-testing-public/139.0.7258.68/linux64/chromedriver-linux64.zip && \
    unzip chromedriver-linux64.zip && \
    mv chromedriver-linux64/chromedriver /usr/local/bin/chromedriver && \
    chmod +x /usr/local/bin/chromedriver && \
    rm -rf chromedriver-linux64.zip chromedriver-linux64
# -----------------------------
# Copy package.json & install deps
# -----------------------------
COPY package*.json ./

# Optional: Upgrade npm
RUN npm install -g npm@11.5.2

# Clean install dependencies
RUN npm install --legacy-peer-deps

# -----------------------------
# Copy app source
# -----------------------------
COPY . .

# -----------------------------
# Build Next.js app
# -----------------------------
RUN npm run build

# -----------------------------
# Expose port for Next.js
# -----------------------------
EXPOSE 3000

# -----------------------------
# Start server
# -----------------------------
CMD ["npm", "start"]

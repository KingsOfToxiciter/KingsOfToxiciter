# Use official Node.js image
FROM node:20

# Install yt-dlp
RUN apt-get update && apt-get install -y \
    python3-pip \
    ffmpeg \
    && pip3 install yt-dlp

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]

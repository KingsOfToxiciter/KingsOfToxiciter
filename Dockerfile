# Node.js base image
FROM node:20

# Install ffmpeg and yt-dlp
RUN apt-get update && apt-get install -y ffmpeg wget \
    && wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    && install -m 755 yt-dlp /usr/local/bin/yt-dlp \
    && rm yt-dlp

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy all source code
COPY . .

# Expose port (Railway uses PORT environment variable)
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]

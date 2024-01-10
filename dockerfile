FROM ubuntu:latest

WORKDIR /app

COPY package*.json ./

RUN apt-get update && \
    apt-get install -y nodejs npm && \
    npm install

# Install Docker client
RUN apt-get install -y docker.io

# Create a directory for the custom Docker socket path
RUN mkdir -p /custom-docker-socket

COPY . .

# Add the volume mount for the custom Docker socket path to the CMD instruction
CMD ["sh", "-c", "exec node index.js && docker run -v /custom-docker-socket:/var/run/docker.sock -p 3000:3000"]

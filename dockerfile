FROM ubuntu:latest

WORKDIR /app

COPY package*.json ./

RUN apt-get update && \
    apt-get install -y nodejs npm && \
    npm install
RUN apt install docker.io

COPY . .

# Add the volume mount for /var/run/docker.sock to the CMD instruction
CMD ["sh", "-c", "exec node index.js && docker run -v /var/run/docker.sock:/var/run/docker.sock -p 3000:3000"]
const express = require('express');
const { exec } = require('child_process');
const Docker = require('dockerode');

const app = express();
const port = 3000;

app.use(express.json());

// Update the Docker client to use the custom Docker socket path
const docker = new Docker({ socketPath: '/custom-docker-socket/docker.sock' });

app.post('/execute', async (req, res) => {
  const { command } = req.body;

  try {
    const result = await executeCommandInDocker(command);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function executeCommandInDocker(command) {
  const container = await docker.createContainer({
    Image: 'ubuntu:latest',
    Cmd: ['/bin/sh', '-c', command],
    Tty: false,
    AttachStdout: true,
    AttachStderr: true,
  });

  const data = await container.start();
  const stream = await container.logs({ follow: true, stdout: true, stderr: true });

  return new Promise((resolve, reject) => {
    let result = '';

    stream.on('data', (chunk) => {
      result += chunk.toString();
    });

    stream.on('end', () => {
      // Clean up the result here
      const cleanedResult = cleanOutput(result);
      resolve(cleanedResult);
    });

    container.wait((err, data) => {
      if (err) reject(err);
      container.remove({ force: true });
    });
  });
}

// Function to clean up the output
function cleanOutput(output) {
  const cleanedOutput = output.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const formattedOutput = cleanedOutput.replace(/\n/g, ' ');
  return formattedOutput;
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

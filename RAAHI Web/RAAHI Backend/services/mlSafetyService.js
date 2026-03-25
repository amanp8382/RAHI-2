const path = require('path');
const { spawn } = require('child_process');

const bundledPythonPath = path.resolve(
  __dirname,
  '../../ML model/ML Model/venv/Scripts/python.exe'
);

const bridgeScriptPath = path.resolve(__dirname, '../scripts/mlSafetyBridge.py');

const pythonCommandCandidates = [
  { command: bundledPythonPath, argsPrefix: [] },
  { command: 'py', argsPrefix: ['-3'] },
  { command: 'python', argsPrefix: [] }
];

const spawnAndParse = (command, args) => new Promise((resolve, reject) => {
  const child = spawn(command, args, {
    cwd: path.dirname(bridgeScriptPath),
    windowsHide: true
  });

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });

  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  child.on('error', (error) => {
    reject(new Error(`Failed to start ML model with ${command}: ${error.message}`));
  });

  child.on('close', (code) => {
    if (code !== 0) {
      reject(new Error(stderr.trim() || `ML model exited with code ${code}`));
      return;
    }

    try {
      const lines = stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      const jsonLine = [...lines].reverse().find((line) => line.startsWith('{') && line.endsWith('}'));
      if (!jsonLine) {
        throw new Error('No JSON payload found in ML model output');
      }
      resolve(JSON.parse(jsonLine));
    } catch (error) {
      reject(new Error(`Invalid ML model output: ${error.message}`));
    }
  });
});

const runMlSafetyScore = async ({ lat, lng, locationName = '' }) => {
  const baseArgs = [bridgeScriptPath, String(lat), String(lng), locationName];
  let lastError = null;

  for (const candidate of pythonCommandCandidates) {
    try {
      return await spawnAndParse(candidate.command, [...candidate.argsPrefix, ...baseArgs]);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('No Python runtime available for ML model execution');
};

module.exports = {
  runMlSafetyScore,
  bundledPythonPath,
  bridgeScriptPath
};

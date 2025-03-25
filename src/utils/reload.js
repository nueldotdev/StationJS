import { watch } from 'chokidar';
import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';

var reloadAmount = 0;

// Start the server as a child process
function startServer(entryFile) {
  if (reloadAmount > 0) {
    console.log(chalk.bgBlackBright(`♻️  Restarting server...`));
  } else {
    console.log(chalk.bgBlackBright(`🚀 Starting Server...`));

    // Increment the reload amount
    reloadAmount++;
  }

  const server = spawn('node', [entryFile], { stdio: 'inherit' });

  server.on('exit', (code) => {
    if (code === 0 || code === null) {
      console.log(chalk.bgBlackBright(`✅ Server stopped gracefully.`));
      console.log(chalk.bgBlackBright(`🚀 Starting Server...`));
    } else {
      console.error(chalk.red(`⚠️ Server terminated with exit code ${code}.`));
    }
  });

  return server;
}

// Restart the server
function restartServer(serverProcess,  entryFile) {
  serverProcess.kill('SIGTERM'); // Gracefully stop the current server

  return startServer(entryFile); // Start a new server process
}

// Hot reload logic
function hotReload(entryFile) {
  let serverProcess = startServer(entryFile);

  // Watch for file changes in the current project directory
  const watcher = watch('./', {
    ignored: /node_modules|\.git/, // Ignore these directories
    persistent: true,
  });

  watcher.on('change', (file) => {
    console.log(chalk.bgBlackBright(`\n🔃 File changed: ${file}`));
    serverProcess = restartServer(serverProcess, entryFile); // Restart the server
  });


  // Handle termination signals
  process.on('SIGINT', () => {
    console.log('\n🚨 Terminating watcher and server 🚨');
    watcher.close();
    serverProcess.kill('SIGTERM');

    process.exit();
  });
}


export { hotReload };
#!/usr/bin/env node

import { hotReload } from "../src/utils/reload.js";
import path from "path";
import { exec } from "child_process";
import fs from "fs";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isValidPackageName(name) {
  return /^([a-z0-9@][a-z0-9-._]*)$/.test(name);
}



// Get the project entry file (default: index.js or user-defined)
const command = process.argv
const args = process.argv[2];


if (args === 'start') {
  const entryFile = "index.js";

  // Resolve the file path
  const filePath = path.resolve(process.cwd(), entryFile);

  // Start the hot reload server
  hotReload(filePath);
} else if (args === "init") {
  if (command.length < 4) {
    console.log("Please provide a project name.");
    process.exit(1);
  }

  const projectName = command[3];

  if (!isValidPackageName(projectName)) {
    console.log("Invalid project name. Use only lowercase letters, numbers, dashes, and dots.");
    process.exit(1);
  }

  
  const projectPath = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.log("Project already exists. Please choose a different name.");
    process.exit(1);
  }

  fs.mkdirSync(projectPath, { recursive: true });

  // ✅ Copy template files
  const templatePath = path.resolve(__dirname, "../template");
  try {
    fs.cpSync(templatePath, projectPath, { recursive: true });
  } catch (err) {
    console.error("Error copying files:", err);
    process.exit(1);
  }

  // ✅ Generate package.json
  const packageJson = {
    name: projectName,
    version: "1.0.0",
    description: "",
    main: "index.js",
    type: "module",
    scripts: {
      start: "node index.js",
      dev: "station start",
    },
    dependencies: {
      "station-x": "^1.0.0",
    },
    devDependencies: {},
  };

  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  console.log("🎉 Project created successfully!");
  console.log(`👉 Next steps:\n   cd ${projectName}\n   npm install\n   npm run dev`);
}
  else if  (args === 'help') {
  console.log("Usage: station <command>");
  console.log("Commands:");
  console.log("  start - Start the server");
  console.log("  init <project-name> - Create a new project");
  console.log("  help - Display help information");
} else {
  console.log("Invalid command.");
  console.log("Run 'station help' for a list of commands.");
  process.exit(1);
}
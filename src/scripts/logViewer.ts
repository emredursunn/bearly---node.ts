import fs from 'fs';
import path from 'path';
import readline from 'readline';

const logsDir = path.join(__dirname, '../utils/logs');
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

// Get command line arguments
const args = process.argv.slice(2);
const flags = {
  level: args.indexOf('--level') !== -1 ? args[args.indexOf('--level') + 1] : null,
  lines: args.indexOf('--lines') !== -1 ? parseInt(args[args.indexOf('--lines') + 1]) : 50,
  today: args.indexOf('--today') !== -1,
  search: args.indexOf('--search') !== -1 ? args[args.indexOf('--search') + 1] : null,
  help: args.indexOf('--help') !== -1 || args.indexOf('-h') !== -1,
  list: args.indexOf('--list') !== -1,
  error: args.indexOf('--error') !== -1,
  clear: args.indexOf('--clear') !== -1,
};

function showHelp() {
  console.log(`
${colors.bright}Log Viewer Utility${colors.reset}

${colors.bright}Usage:${colors.reset}
  ts-node src/scripts/logViewer.ts [options]

${colors.bright}Options:${colors.reset}
  --level <level>   Filter logs by level (error, warn, info, debug)
  --lines <number>  Number of lines to display (default: 50)
  --today           Show only today's logs
  --search <text>   Search for specific text in logs
  --list            List all log files
  --error           Show only error logs
  --clear           Clear all log files (BE CAREFUL!)
  --help, -h        Show this help message

${colors.bright}Examples:${colors.reset}
  ts-node src/scripts/logViewer.ts --level error --lines 20
  ts-node src/scripts/logViewer.ts --today --search "API request"
  ts-node src/scripts/logViewer.ts --list
  `);
}

function colorizeLogLine(line: string): string {
  if (line.includes('[ERROR]')) {
    return `${colors.red}${line}${colors.reset}`;
  } else if (line.includes('[WARN]')) {
    return `${colors.yellow}${line}${colors.reset}`;
  } else if (line.includes('[INFO]')) {
    return `${colors.green}${line}${colors.reset}`;
  } else if (line.includes('[DEBUG]')) {
    return `${colors.blue}${line}${colors.reset}`;
  }
  return line;
}

async function listLogFiles() {
  try {
    if (!fs.existsSync(logsDir)) {
      console.log(`${colors.yellow}No logs directory found. Create it by running the server first.${colors.reset}`);
      return;
    }

    const files = fs.readdirSync(logsDir);
    
    if (files.length === 0) {
      console.log(`${colors.yellow}No log files found.${colors.reset}`);
      return;
    }

    console.log(`${colors.bright}Available log files:${colors.reset}`);
    files.forEach(file => {
      const stats = fs.statSync(path.join(logsDir, file));
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      const modifiedDate = stats.mtime.toLocaleString();
      
      if (file.includes('error')) {
        console.log(`${colors.red}${file}${colors.reset} - ${fileSizeInMB} MB - Last modified: ${modifiedDate}`);
      } else {
        console.log(`${file} - ${fileSizeInMB} MB - Last modified: ${modifiedDate}`);
      }
    });
  } catch (error) {
    console.error(`${colors.red}Error listing log files:${colors.reset}`, error);
  }
}

async function clearLogFiles() {
  try {
    if (!fs.existsSync(logsDir)) {
      console.log(`${colors.yellow}No logs directory found.${colors.reset}`);
      return;
    }

    const files = fs.readdirSync(logsDir);
    
    if (files.length === 0) {
      console.log(`${colors.yellow}No log files to clear.${colors.reset}`);
      return;
    }

    console.log(`${colors.yellow}Are you sure you want to delete ${files.length} log files? (y/n)${colors.reset}`);
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('', (answer) => {
      if (answer.toLowerCase() === 'y') {
        files.forEach(file => {
          fs.unlinkSync(path.join(logsDir, file));
        });
        console.log(`${colors.green}All log files cleared.${colors.reset}`);
      } else {
        console.log(`${colors.blue}Operation cancelled.${colors.reset}`);
      }
      rl.close();
    });
  } catch (error) {
    console.error(`${colors.red}Error clearing log files:${colors.reset}`, error);
  }
}

async function viewLogs() {
  try {
    if (!fs.existsSync(logsDir)) {
      console.log(`${colors.yellow}No logs directory found. Create it by running the server first.${colors.reset}`);
      return;
    }

    let logFiles = fs.readdirSync(logsDir);
    
    // Filter by today if needed
    if (flags.today) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      logFiles = logFiles.filter(file => file.includes(today));
    }
    
    // Filter error logs if needed
    if (flags.error) {
      logFiles = logFiles.filter(file => file.includes('error'));
    }
    
    if (logFiles.length === 0) {
      console.log(`${colors.yellow}No matching log files found.${colors.reset}`);
      return;
    }

    // Sort by date (newest first)
    logFiles.sort().reverse();
    
    let allLines: string[] = [];
    
    for (const file of logFiles) {
      const filePath = path.join(logsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      let lines = fileContent.split('\n').filter(line => line.trim() !== '');
      
      // Filter by level if needed
      if (flags.level) {
        const levelUpper = flags.level.toUpperCase();
        lines = lines.filter(line => line.includes(`[${levelUpper}]`));
      }
      
      // Filter by search term if needed
      if (flags.search) {
        lines = lines.filter(line => line.toLowerCase().includes(flags.search!.toLowerCase()));
      }
      
      allLines.push(...lines);
    }
    
    // Take the last N lines
    const linesToShow = allLines.slice(-flags.lines);
    
    if (linesToShow.length === 0) {
      console.log(`${colors.yellow}No matching log entries found.${colors.reset}`);
      return;
    }
    
    console.log(`${colors.bright}Showing ${linesToShow.length} log entries:${colors.reset}\n`);
    linesToShow.forEach(line => {
      console.log(colorizeLogLine(line));
    });
    
  } catch (error) {
    console.error(`${colors.red}Error viewing logs:${colors.reset}`, error);
  }
}

// Main execution
if (flags.help) {
  showHelp();
} else if (flags.list) {
  listLogFiles();
} else if (flags.clear) {
  clearLogFiles();
} else {
  viewLogs();
}

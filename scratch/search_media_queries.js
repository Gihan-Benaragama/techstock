import fs from 'fs';
import path from 'path';

const dir = 'c:/Users/My PC/Desktop/project/Tech Stock/techstock/frontend';

function scanDir(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.css') || file.endsWith('.html')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split(/\r?\n/);
      lines.forEach((line, index) => {
        if (line.includes('@media')) {
          console.log(`${file}:${index + 1}: ${line.trim()}`);
        }
      });
    }
  }
}

scanDir(dir);

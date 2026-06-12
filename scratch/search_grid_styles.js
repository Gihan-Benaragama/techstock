import fs from 'fs';
const content = fs.readFileSync('c:/Users/My PC/Desktop/project/Tech Stock/techstock/frontend/styles.css', 'utf8');
const lines = content.split(/\r?\n/);
lines.forEach((line, index) => {
  if (line.includes('category-grid') || line.includes('#productsList')) {
    console.log(`L${index + 1}: ${line.trim()}`);
  }
});

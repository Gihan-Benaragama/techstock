import fs from 'fs';
import path from 'path';

const dir = 'c:/Users/My PC/Desktop/project/Tech Stock/techstock/frontend';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.html')) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    if (content.includes('product-grid')) {
      console.log(`${file} contains product-grid`);
    }
    if (content.includes('category-grid')) {
      console.log(`${file} contains category-grid`);
    }
  }
});

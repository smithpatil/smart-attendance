const fs = require('fs');
const path = require('path');

const dir = 'd:/smart_attendance/client/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace "http://localhost:8000..." with `http://${window.location.hostname}:8000...`
  // We need to handle both " and ` quotes.
  content = content.replace(/["`]http:\/\/localhost:8000(.*?)[`"]/g, '`http://${window.location.hostname}:8000$1`');
  
  fs.writeFileSync(filePath, content);
});

console.log('Fixed API URLs');

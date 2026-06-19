const fs = require('fs');
const transcriptPath = 'C:/Users/SMITH PATIL/.gemini/antigravity-ide/brain/3188a9b1-ca6e-45a4-b5c0-3d9448f782ea/.system_generated/logs/transcript.jsonl';
const text = fs.readFileSync(transcriptPath, 'utf-8');

const targetFiles = [
  'd:/smart_attendance/client/src/pages/LandingPage.tsx',
  'd:/smart_attendance/client/src/pages/LoginPage.tsx'
];

for (const target of targetFiles) {
  const marker = 'File Path: `file:///' + target + '`\\nTotal Lines:';
  const index = text.indexOf(marker);
  if (index !== -1) {
    const startStr = 'Please note that any changes targeting the original code should remove the line number, colon, and leading space.\\n';
    const startIndex = text.indexOf(startStr, index);
    if (startIndex !== -1) {
      const start = startIndex + startStr.length;
      const endMarker = '\\nThe above content shows the entire, complete file contents';
      const endIndex = text.indexOf(endMarker, start);
      
      if (endIndex !== -1) {
        let content = text.substring(start, endIndex);
        
        // Remove the \n escape sequences since we read raw json
        // wait, since text is raw json, line breaks are represented as `\n` in the string!
        // so we need to split by `\n` (literal backslash followed by n)
        let lines = content.split('\\n');
        
        let actualCodeLines = lines.map(l => {
           // Also unescape \" to "
           l = l.replace(/\\"/g, '"');
           const match = l.match(/^\d+:\s?(.*)$/);
           return match ? match[1] : l;
        });
        
        fs.writeFileSync(target, actualCodeLines.join('\n'));
        console.log("Restored: " + target);
      } else {
        console.log("End marker not found for " + target);
      }
    }
  } else {
    console.log("Marker not found for " + target);
  }
}

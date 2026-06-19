const fs = require('fs');
const transcriptPath = 'C:/Users/SMITH PATIL/.gemini/antigravity-ide/brain/3188a9b1-ca6e-45a4-b5c0-3d9448f782ea/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n').filter(Boolean);

const targetFiles = [
  'd:/smart_attendance/client/src/pages/LandingPage.tsx',
  'd:/smart_attendance/client/src/pages/LoginPage.tsx',
  'd:/smart_attendance/client/src/pages/StudentDashboard.tsx',
  'd:/smart_attendance/client/src/pages/TeacherDashboard.tsx',
  'd:/smart_attendance/client/src/pages/QRAttendance.tsx',
  'd:/smart_attendance/client/src/pages/QRScanner.tsx',
  'd:/smart_attendance/client/src/pages/ProfilePage.tsx'
];

const restored = {};

for (const line of lines) {
  for (const target of targetFiles) {
    if (!restored[target] && line.includes('File Path: `file://' + target + '`')) {
      const obj = JSON.parse(line);
      // We need to find where the content is in the object tree
      let contentStr = "";
      
      function searchContent(o) {
        if (typeof o === 'string') {
          if (o.includes('File Path: `file://' + target + '`')) contentStr = o;
        } else if (typeof o === 'object' && o !== null) {
          for (let k in o) searchContent(o[k]);
        }
      }
      
      searchContent(obj);
      
      if (contentStr) {
        const endMarker = "The above content shows the entire, complete file contents";
        if (contentStr.includes(endMarker)) {
           let fileLines = contentStr.split('\n');
           let startIndex = fileLines.findIndex(l => l.includes('The following code has been modified to include a line number before every line'));
           let endIndex = fileLines.findIndex(l => l.includes(endMarker));
           if (startIndex !== -1 && endIndex !== -1) {
               let actualCodeLines = fileLines.slice(startIndex + 1, endIndex);
               actualCodeLines = actualCodeLines.map(l => {
                  const match = l.match(/^\d+:\s?(.*)$/);
                  return match ? match[1] : l;
               });
               fs.writeFileSync(target, actualCodeLines.join('\n'));
               console.log("Restored: " + target);
               restored[target] = true;
           }
        }
      }
    }
  }
}

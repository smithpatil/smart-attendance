const fs = require('fs');
const transcriptPath = 'C:/Users/SMITH PATIL/.gemini/antigravity-ide/brain/3188a9b1-ca6e-45a4-b5c0-3d9448f782ea/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n').filter(Boolean);

const targetFiles = [
  'd:/smart_attendance/client/src/App.tsx',
  'd:/smart_attendance/client/src/pages/LandingPage.tsx',
  'd:/smart_attendance/client/src/pages/LoginPage.tsx',
  'd:/smart_attendance/client/src/pages/StudentDashboard.tsx',
  'd:/smart_attendance/client/src/pages/TeacherDashboard.tsx',
  'd:/smart_attendance/client/src/pages/QRAttendance.tsx',
  'd:/smart_attendance/client/src/pages/QRScanner.tsx',
  'd:/smart_attendance/client/src/pages/ProfilePage.tsx',
  'd:/smart_attendance/client/src/components/TopHeader.tsx'
];

const restored = {};

for (const line of lines) {
  try {
    const obj = JSON.parse(line);
    if (obj.type === 'TOOL_RESPONSE' && obj.content) {
      if (obj.content.includes('File Path: ')) {
        const match = obj.content.match(/File Path: `file:\/\/(.*?)`/);
        if (match) {
           console.log("Saw " + match[1]);
        }
      }
      for (const target of targetFiles) {
        if (!restored[target] && obj.content.includes('File Path: `file://' + target + '`')) {
          // Extract file content
          let content = obj.content;
          // find the line before "The above content shows the entire, complete file contents"
          const endMarker = "The above content shows the entire, complete file contents";
          if (content.includes(endMarker)) {
             let fileLines = content.split('\n');
             let startIndex = fileLines.findIndex(l => l.includes('The following code has been modified to include a line number before every line'));
             let endIndex = fileLines.findIndex(l => l.includes(endMarker));
             if (startIndex !== -1 && endIndex !== -1) {
                 let actualCodeLines = fileLines.slice(startIndex + 1, endIndex);
                 // remove the line number prefix e.g. "1: "
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
  } catch (e) {
  }
}

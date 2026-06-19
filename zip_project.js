const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

const output = fs.createWriteStream(path.join('d:\\', 'smart_attendance_project.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('Archiver has been finalized and the output file descriptor has closed.');
});

archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

// Add the directory, but ignore node_modules, .env, and dist folders
archive.glob('**/*', {
  cwd: 'd:\\smart_attendance',
  ignore: [
    '**/node_modules/**', 
    'server/.env', 
    'client/dist/**', 
    '**/.git/**',
    '*.zip'
  ]
});

archive.finalize();

const innosetup = require('innosetup-compiler');
const path = require('path');

const issPath = path.resolve(__dirname, 'installer.iss');

console.log('Building official Windows Setup Installer via Inno Setup 6...');
console.log('Script:', issPath);

innosetup(issPath, { verbose: false }, (err) => {
  if (err) {
    console.error('Inno Setup build failed:', err);
    process.exit(1);
  }
  console.log('========================================================');
  console.log('SUCCESS: SweetBakery-POS-Setup.exe built successfully!');
  console.log('Location:', path.resolve(__dirname, '..', 'SweetBakery-POS-Setup.exe'));
  console.log('========================================================');
});

// auto-push.js
const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');

// Ruta del archivo a vigilar
const fileToWatch = path.join(__dirname, 'public', 'data.json');

const watcher = chokidar.watch(fileToWatch, {
  persistent: true,
  ignoreInitial: true,
});

console.log('🚀 Vigilando cambios en data.json...');

watcher.on('change', () => {
  console.log('🔄 Cambios detectados en data.json. Ejecutando Git...');

  const now = new Date();
  const fecha = now.toISOString().replace('T', ' ').substring(0, 19); // formato YYYY-MM-DD HH:mm:ss
  const commitMessage = `Auto push tras guardar data.json [${fecha}]`;

  const gitCommands = `
    git add public/data.json &&
    git commit -m "${commitMessage}" &&
    git pull origin main --rebase &&
    git push origin main
  `;

  exec(gitCommands, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error al ejecutar comandos Git: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️  Git stderr:\n${stderr}`);
    }
    console.log(`✅ Git stdout:\n${stdout}`);
  });
});

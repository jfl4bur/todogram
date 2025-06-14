import { execSync } from 'child_process';
import readline from 'readline/promises';
import fs from 'fs';
import path from 'path';

let isProcessing = false;
const DATA_FILE = 'public/data.json';
const CHECK_INTERVAL = 5000; // 5 segundos

function exec(cmd, silent = false) {
  try {
    const output = execSync(cmd, { stdio: silent ? 'pipe' : 'inherit' });
    return output?.toString().trim() || '';
  } catch (err) {
    return err.message;
  }
}

function promptMenu() {
  console.log('\n❌ Error en git pull: tienes cambios sin guardar.\n');
  console.log('Selecciona una opción para resolver el conflicto:\n');
  console.log('[1] Hacer commit y luego pull con merge');
  console.log('[2] Guardar cambios en stash, hacer pull, y aplicar stash');
  console.log('[3] Forzar push (sin hacer pull)');
  console.log('[x] Salir sin hacer nada\n');
}

function handleMenuOption(option) {
  switch (option) {
    case '1':
      console.log('🔄 Ejecutando: add, commit y pull...');
      exec('git add .');
      const commitResult = exec('git commit -m "Auto commit antes de pull"', true);
      if (!commitResult.includes('nothing to commit')) {
        console.log('✅ Commit realizado');
      }
      exec('git pull');
      exec('git push');
      console.log('✅ Operación completada.');
      break;
    case '2':
      console.log('🔄 Ejecutando: stash, pull, stash pop...');
      exec('git stash');
      exec('git pull');
      exec('git stash pop');
      exec('git push');
      console.log('✅ Operación completada.');
      break;
    case '3':
      console.log('🔄 Ejecutando: force push...');
      exec('git push -f');
      console.log('✅ Force push completado.');
      break;
    case 'x':
    case 'X':
      console.log('❌ Acción cancelada.');
      break;
    default:
      console.log('❌ Opción no válida. Acción cancelada.');
  }
}

async function handleConflictAutomatically() {
  console.log('🤖 Resolviendo conflicto automáticamente...');
  
  // Estrategia por defecto: stash, pull, stash pop
  try {
    console.log('🔄 Guardando cambios en stash...');
    exec('git stash');
    
    console.log('🔄 Haciendo pull...');
    exec('git pull');
    
    console.log('🔄 Restaurando cambios desde stash...');
    const stashResult = exec('git stash pop', true);
    
    if (stashResult.includes('CONFLICT') || stashResult.includes('error')) {
      console.log('⚠️ Conflicto detectado al aplicar stash. Manteniendo cambios en stash.');
      console.log('💡 Ejecuta manualmente: git stash list y git stash apply');
      return false;
    }
    
    console.log('🔄 Haciendo push final...');
    exec('git push');
    console.log('✅ Conflicto resuelto automáticamente.');
    return true;
    
  } catch (error) {
    console.log('❌ Error al resolver conflicto automáticamente:', error.message);
    console.log('💡 Revisa manualmente el repositorio.');
    return false;
  }
}

async function autoPush() {
  if (isProcessing) return;
  
  const gitStatus = exec('git status --porcelain', true);
  if (!gitStatus.includes('data.json')) {
    return;
  }

  isProcessing = true;
  console.log(`[${new Date().toLocaleTimeString()}] 🔄 Cambios detectados en data.json. Ejecutando Git...`);
  
  exec('git add public/data.json');
  
  const commitResult = exec(`git commit -m "Auto push tras guardar data.json [${new Date().toISOString()}]"`, true);
  if (commitResult.includes('error')) {
    console.log('❌ Error en commit:', commitResult);
    isProcessing = false;
    return;
  }
  console.log('✅ Commit realizado');

  // Intentar pull
  console.log('🔄 Intentando git pull...');
  const pullResult = exec('git pull', true);
  
  if (pullResult.includes('error') || pullResult.includes('cannot pull') || pullResult.includes('Please commit')) {
    console.log('❌ Error en git pull:');
    console.log(pullResult);
    
    // Resolver automáticamente en lugar de mostrar menú
    const resolved = await handleConflictAutomatically();
    if (!resolved) {
      console.log('💡 Para resolver manualmente, detén PM2 y ejecuta el script localmente');
    }
    
    isProcessing = false;
    return;
  }

  // Si el pull fue exitoso, hacer push
  try {
    exec('git push');
    console.log('✅ Push completado con éxito.');
  } catch (pushError) {
    console.log('❌ Error en git push:', pushError.message);
    // Intentar resolver automáticamente
    await handleConflictAutomatically();
  }
  
  isProcessing = false;
}

// Función principal del watcher
async function startWatching() {
  console.log(`🚀 Git Auto-Push iniciado. Vigilando cambios en ${DATA_FILE}...`);
  console.log(`📊 Verificando cada ${CHECK_INTERVAL/1000} segundos`);
  console.log(`🤖 Modo automático: resuelve conflictos con stash/pull/pop`);
  
  // Verificar si el archivo existe
  if (!fs.existsSync(DATA_FILE)) {
    console.log(`⚠️ Advertencia: ${DATA_FILE} no existe`);
  }
  
  // Loop principal
  setInterval(async () => {
    try {
      await autoPush();
    } catch (error) {
      console.error('❌ Error en autoPush:', error.message);
    }
  }, CHECK_INTERVAL);
}

// Manejo de señales para cierre limpio
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo Git Auto-Push...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Deteniendo Git Auto-Push...');
  process.exit(0);
});

// Iniciar el watcher
startWatching().catch(console.error);
import { execSync } from 'child_process';
import readline from 'readline/promises';

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

async function startInteractiveMenu() {
  promptMenu();
  
  const rl = readline.createInterface({ 
    input: process.stdin, 
    output: process.stdout 
  });
  
  try {
    const answer = await rl.question('👉 Escribe el número de opción: ');
    handleMenuOption(answer.trim());
  } catch (error) {
    console.log('\n❌ Error en la entrada. Acción cancelada.');
  } finally {
    rl.close();
  }
}

async function autoPush() {
  const gitStatus = exec('git status --porcelain', true);
  if (!gitStatus.includes('data.json')) {
    console.log('ℹ️ No hay cambios en data.json.');
    return;
  }

  console.log('🔄 Cambios detectados en data.json. Ejecutando Git...');
  exec('git add public/data.json');
  
  const commitResult = exec(`git commit -m "Auto push tras guardar data.json [${new Date().toISOString()}]"`, true);
  if (commitResult.includes('error')) {
    console.log('❌ Error en commit:', commitResult);
    return;
  }
  console.log('✅ Commit realizado');

  // Intentar pull
  console.log('🔄 Intentando git pull...');
  const pullResult = exec('git pull', true);
  
  if (pullResult.includes('error') || pullResult.includes('cannot pull') || pullResult.includes('Please commit')) {
    console.log('❌ Error en git pull:');
    console.log(pullResult);
    await startInteractiveMenu();
    return;
  }

  // Si el pull fue exitoso, hacer push
  try {
    exec('git push');
    console.log('✅ Push completado con éxito.');
  } catch (pushError) {
    console.log('❌ Error en git push:', pushError.message);
    await startInteractiveMenu();
  }
}

// Ejecutar
autoPush().catch(console.error);
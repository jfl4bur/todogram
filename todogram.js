#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import gradient from 'gradient-string';
import figlet from 'figlet';
import { execa } from 'execa';

function clearConsole() {
  process.stdout.write('\x1Bc'); // Limpia la consola (compatible con la mayoría de terminales)
}

const printTitle = () => {
  clearConsole();
  console.log(
    gradient.instagram(
      figlet.textSync('Todogram TV', {
        font: 'Slant',
        horizontalLayout: 'default',
        verticalLayout: 'default'
      })
    )
  );
};

const mainMenu = async () => {
  printTitle();

  const choices = [
    { name: '🚀 [1] Obtener datos de Notion y TMDB (npm run start)', value: 'start' },
    { name: '🤖 [2] Iniciar Auto Push con opciones interactivas', value: 'auto-push' },
    { name: '🪵 [3] Ver logs en tiempo real (pm2 logs auto-push)', value: 'logs' },
    { name: '📦 [4] Push completo con resolución de conflictos', value: 'push' },
    { name: '⚡ [5] Forzar Workflow en GitHub', value: 'force-workflow' },
    { name: '🧰 [6] Instalación y chequeo de dependencias', value: 'check-deps' },
    { name: '❌ [x] Salir', value: 'exit' }
  ];

  const { opcion } = await inquirer.prompt([
    {
      type: 'list',
      name: 'opcion',
      message: chalk.cyan('Selecciona una opción:'),
      choices,
      pageSize: choices.length
    }
  ]);

  switch (opcion) {
    case 'start':
      console.log(chalk.green('\nEjecutando: Obtener datos de Notion y TMDB...\n'));
      await execa('node', ['start.js'], { stdio: 'inherit' });
      break;

    case 'auto-push':
      console.log(chalk.green('\nEjecutando: Iniciar Auto Push...\n'));
      await execa('node', ['auto-push.js'], { stdio: 'inherit' });
      break;

    case 'logs':
      console.log(chalk.green('\nMostrando logs en tiempo real...\n'));
      await execa('pm2', ['logs', 'auto-push'], { stdio: 'inherit' });
      break;

    case 'push':
      console.log(chalk.green('\nEjecutando push completo...\n'));
      await execa('git', ['add', '.'], { stdio: 'inherit' });
      try {
        await execa('git', ['commit', '-m', 'actualización auto'], { stdio: 'inherit' });
      } catch {
        // Puede que no haya cambios para commitear, ignoramos error
      }
      await execa('git', ['push'], { stdio: 'inherit' });
      break;

    case 'force-workflow':
      console.log(chalk.green('\nForzando workflow en GitHub...\n'));
      await execa('gh', ['workflow', 'run', 'sync.yml'], { stdio: 'inherit' });
      break;

    case 'check-deps':
      console.log(chalk.green('\nChequeando dependencias...\n'));
      // Aquí puedes poner la lógica para chequear instalaciones
      break;

    case 'exit':
      console.log(chalk.yellow('\nSaliendo... ¡Hasta luego!\n'));
      process.exit(0);
  }

  console.log(chalk.cyan('\nPresiona Enter para volver al menú principal.'));
  await inquirer.prompt([{ type: 'input', name: 'enter', message: '' }]);

  return mainMenu();
};

mainMenu();

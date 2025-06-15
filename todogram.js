import readline from 'readline';
import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores ANSI para terminal
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    black: '\x1b[30m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    gray: '\x1b[90m',
    darkGreen: '\x1b[32m\x1b[2m'
};

class TodogramMenu {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.isRunning = false;
        this.currentSelection = 0;
        
        // Dimensiones ajustadas para evitar desbordamiento
        this.frameWidth = 80; // Reducido aún más
        this.columnWidth = 35; // Reducido para mejor ajuste
        this.lastRenderedMenu = '';
        this.keyListener = null;
        this.currentNumberInput = ''; // Para manejar números de múltiples dígitos
        this.numberInputTimeout = null;
        
        this.menuOptions = [
            { id: '1', title: '🚀 Obtener datos Notion/TMDB', command: 'npm run start', category: 'principal' },
            { id: '2', title: '🤖 Auto-push automático', command: 'pm2 start auto-push.js --name auto-push', category: 'principal' },
            { id: '3', title: '🪵 Ver logs tiempo real', command: 'pm2 logs auto-push', category: 'principal' },
            { id: '4', title: '📦 Push completo Git', command: 'git add . && git commit -m "Auto-update" && git push origin main', category: 'principal' },
            { id: '5', title: '⚡ Workflow GitHub Actions', command: 'gh workflow run deploy.yml', category: 'deploy' },
            { id: '6', title: '🌐 Deploy GitHub Pages', command: 'npm run deploy:github', category: 'deploy' },
            { id: '7', title: '🚀 Deploy Netlify/Vercel', command: 'npm run deploy:netlify', category: 'deploy' },
            { id: '8', title: '⚙️ Config variables entorno', command: 'cp .env.example .env && nano .env', category: 'deploy' },
            { id: '9', title: '⏹️ Detener PM2 auto-push', command: 'pm2 stop auto-push', category: 'pm2' },
            { id: '10', title: '🔄 Reiniciar procesos PM2', command: 'pm2 restart all', category: 'pm2' },
            { id: '11', title: '📊 Estado PM2', command: 'pm2 status', category: 'pm2' },
            { id: '12', title: '🗂️ Lista PM2', command: 'pm2 list', category: 'pm2' },
            { id: '13', title: '🔧 Chequear dependencias', command: 'npm install && npm audit fix', category: 'dev' },
            { id: '14', title: '🛠️ Actualizar dependencias', command: 'npm update && npm audit fix --force', category: 'dev' },
            { id: '15', title: '🔍 Ejecutar tests', command: 'npm test', category: 'dev' },
            { id: '16', title: '📝 Generar docs', command: 'npm run docs:generate', category: 'dev' },
            { id: '17', title: '🧹 Limpiar temp files', command: 'npm run clean && npm cache clean --force', category: 'clean' },
            { id: '18', title: '✨ Update datos Notion/TMDB', command: 'npm run update:data', category: 'clean' },
            { id: '19', title: '🔍 Analizar rendimiento', command: 'npm run analyze', category: 'clean' },
            { id: '20', title: '📊 Reporte de estado', command: 'npm run status:report', category: 'clean' }
        ];
    }

    // Configurar navegación con teclado
    setupKeyboardNavigation() {
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }
        process.stdin.setEncoding('utf8');
        
        // Limpiar listener previo
        process.stdin.removeAllListeners('data');
        
        // Crear nuevo listener
        this.keyListener = (key) => this.handleKeyPress(key);
        process.stdin.on('data', this.keyListener);
    }

    // Manejar entrada de números de múltiples dígitos
    handleNumberInput(digit) {
        this.currentNumberInput += digit;
        
        // Limpiar timeout previo
        if (this.numberInputTimeout) {
            clearTimeout(this.numberInputTimeout);
        }
        
        // Establecer nuevo timeout
        this.numberInputTimeout = setTimeout(() => {
            const num = parseInt(this.currentNumberInput);
            if (num >= 1 && num <= 20) {
                this.currentSelection = num - 1;
                this.showMainMenu();
            }
            this.currentNumberInput = '';
        }, 500); // 500ms de espera para números de múltiples dígitos
    }

    // Función para limpiar texto de códigos ANSI
    cleanAnsiCodes(text) {
        return text.replace(/\x1b\[[0-9;]*m/g, '');
    }

    // Función para crear líneas con ancho fijo
    createFixedLine(content = '', align = 'left') {
        const cleanContent = this.cleanAnsiCodes(content);
        const availableWidth = this.frameWidth - 4; // 2 para bordes + 2 de margen
        
        let finalContent = content;
        
        // Truncar si es necesario
        if (cleanContent.length > availableWidth) {
            finalContent = this.truncateStringWithAnsi(content, availableWidth - 3) + '...';
        }
        
        const finalCleanLength = this.cleanAnsiCodes(finalContent).length;
        const padding = Math.max(0, availableWidth - finalCleanLength);
        
        let line;
        if (align === 'center') {
            const leftPad = Math.floor(padding / 2);
            const rightPad = padding - leftPad;
            line = `║ ${' '.repeat(leftPad)}${finalContent}${' '.repeat(rightPad)} ║`;
        } else if (align === 'right') {
            line = `║ ${' '.repeat(padding)}${finalContent} ║`;
        } else {
            line = `║ ${finalContent}${' '.repeat(padding)} ║`;
        }
        
        return line;
    }

    // Truncar string preservando códigos ANSI
    truncateStringWithAnsi(str, maxLength) {
        let visualLength = 0;
        let result = '';
        let i = 0;
        
        while (i < str.length && visualLength < maxLength) {
            if (str[i] === '\x1b' && str[i + 1] === '[') {
                // Encontrar el final de la secuencia ANSI
                let escapeSeq = '';
                while (i < str.length && str[i] !== 'm') {
                    escapeSeq += str[i];
                    i++;
                }
                if (i < str.length) {
                    escapeSeq += str[i];
                    i++;
                }
                result += escapeSeq;
            } else {
                result += str[i];
                visualLength++;
                i++;
            }
        }
        
        return result;
    }

    // Arte ASCII para el título más compacto
    getTitleArt() {
        return [
            `${colors.cyan}${colors.bright}████████╗ ██████╗ ██████╗  ██████╗  ██████╗ ██████╗  █████╗ ███╗   ███╗`,
            `╚══██╔══╝██╔═══██╗██╔══██╗██╔═══██╗██╔════╝ ██╔══██╗██╔══██╗████╗ ████║`,
            `   ██║   ██║   ██║██║  ██║██║   ██║██║  ███╗██████╔╝███████║██╔████╔██║`,
            `   ██║   ██║   ██║██║  ██║██║   ██║██║   ██║██╔══██╗██╔══██║██║╚██╔╝██║`,
            `   ██║   ╚██████╔╝██████╔╝╚██████╔╝╚██████╔╝██║  ██║██║  ██║██║ ╚═╝ ██║`,
            `   ╚═╝    ╚═════╝ ╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝${colors.reset}`
        ];
    }

    // Limpiar pantalla completamente
    clearScreen() {
        process.stdout.write('\x1b[2J\x1b[H');
    }

    // Obtener color por categoría
    getCategoryColor(category) {
        const colorMap = {
            'principal': colors.green,
            'deploy': colors.magenta,
            'pm2': colors.blue,
            'dev': colors.cyan,
            'clean': colors.red
        };
        return colorMap[category] || colors.white;
    }

    // Renderizar opción del menú con texto negro en selección
    renderMenuItemColumn(option, index, isSelected) {
        const categoryColor = this.getCategoryColor(option.category);
        const arrow = isSelected ? ' ◄' : '';
        
        const baseContent = `[${option.id.padStart(2)}] ${option.title}${arrow}`;
        const maxLength = this.columnWidth - 2;
        
        let finalContent = baseContent;
        if (this.cleanAnsiCodes(baseContent).length > maxLength) {
            finalContent = this.truncateStringWithAnsi(baseContent, maxLength - 3) + '...';
        }
        
        if (isSelected) {
            // Texto negro en fondo verde para mejor legibilidad
            return `${colors.bgGreen}${colors.black}${colors.bright}${finalContent}${colors.reset}`;
        } else {
            return `${categoryColor}${finalContent}${colors.reset}`;
        }
    }

    // Crear línea con dos columnas
    createTwoColumnLine(leftContent = '', rightContent = '') {
        const maxColWidth = Math.floor((this.frameWidth - 6) / 2); // -6 por bordes y separador
        
        // Limpiar y truncar contenido
        let leftFinal = leftContent;
        let rightFinal = rightContent;
        
        const leftClean = this.cleanAnsiCodes(leftContent);
        const rightClean = this.cleanAnsiCodes(rightContent);
        
        if (leftClean.length > maxColWidth) {
            leftFinal = this.truncateStringWithAnsi(leftContent, maxColWidth - 3) + '...';
        }
        
        if (rightClean.length > maxColWidth) {
            rightFinal = this.truncateStringWithAnsi(rightContent, maxColWidth - 3) + '...';
        }
        
        // Calcular padding
        const leftFinalClean = this.cleanAnsiCodes(leftFinal);
        const rightFinalClean = this.cleanAnsiCodes(rightFinal);
        
        const leftPadding = Math.max(0, maxColWidth - leftFinalClean.length);
        const rightPadding = Math.max(0, maxColWidth - rightFinalClean.length);
        
        const leftColumn = leftFinal + ' '.repeat(leftPadding);
        const rightColumn = rightFinal + ' '.repeat(rightPadding);
        
        return `║ ${leftColumn} │ ${rightColumn} ║`;
    }

    // Mostrar menú principal sin parpadeo
    showMainMenu() {
        const menuContent = [];
        
        // Bordes
        const topBorder = '╔' + '═'.repeat(this.frameWidth - 2) + '╗';
        const bottomBorder = '╚' + '═'.repeat(this.frameWidth - 2) + '╝';
        
        menuContent.push(`${colors.white}${colors.bright}${topBorder}`);
        
        // Título compacto
        const titleLines = this.getTitleArt();
        titleLines.forEach(line => {
            menuContent.push(this.createFixedLine(line, 'center'));
        });
        
        menuContent.push(this.createFixedLine(''));
        menuContent.push(this.createFixedLine(`${colors.magenta}🔥 SISTEMA DE GESTIÓN TODOGRAM 🔥${colors.white}`, 'center'));
        menuContent.push(this.createFixedLine(''));
        
        // Información del sistema más compacta
        const nodeVersion = process.version;
        const uptime = Math.floor(process.uptime());
        const memUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const sysInfo = `${colors.gray}NODE:${colors.yellow}${nodeVersion}${colors.white} │ ${colors.gray}UP:${colors.yellow}${uptime}s${colors.white} │ ${colors.gray}RAM:${colors.yellow}${memUsage}MB${colors.white}`;
        menuContent.push(this.createFixedLine(sysInfo, 'center'));
        menuContent.push(this.createFixedLine(''));
        
        // Separador del menú
        const separator = '═'.repeat(Math.floor((this.frameWidth - 10) / 2));
        menuContent.push(this.createFixedLine(`${separator} MENÚ ${separator}`, 'center'));
        menuContent.push(this.createFixedLine(''));
        
        // Headers de columnas
        const leftHeader = `${colors.cyan}📊 OPERACIONES (1-10)${colors.white}`;
        const rightHeader = `${colors.magenta}🔧 MANTENIMIENTO (11-20)${colors.white}`;
        menuContent.push(this.createTwoColumnLine(leftHeader, rightHeader));
        menuContent.push(this.createFixedLine(''));
        
        // Opciones en dos columnas
        for (let i = 0; i < 10; i++) {
            const leftOption = this.menuOptions[i];
            const rightOption = this.menuOptions[i + 10];
            
            const leftIsSelected = this.currentSelection === i;
            const rightIsSelected = this.currentSelection === i + 10;
            
            let leftContent = '';
            let rightContent = '';
            
            if (leftOption) {
                leftContent = this.renderMenuItemColumn(leftOption, i, leftIsSelected);
            }
            
            if (rightOption) {
                rightContent = this.renderMenuItemColumn(rightOption, i + 10, rightIsSelected);
            }
            
            menuContent.push(this.createTwoColumnLine(leftContent, rightContent));
        }
        
        menuContent.push(this.createFixedLine(''));
        
        // Controles
        const exitControl = `${colors.red}❌ [X]${colors.white} Salir`;
        const helpControl = `${colors.green}ℹ️ [H]${colors.white} Ayuda`;
        menuContent.push(this.createTwoColumnLine(exitControl, helpControl));
        
        menuContent.push(`${bottomBorder}${colors.reset}`);
        
        // Renderizar solo si cambió para evitar parpadeo
        const newMenuContent = menuContent.join('\n');
        if (newMenuContent !== this.lastRenderedMenu) {
            this.clearScreen();
            console.log(newMenuContent);
            this.lastRenderedMenu = newMenuContent;
        }
        
        // Información de navegación compacta
        const selectedOption = this.menuOptions[this.currentSelection];
        const currentInputDisplay = this.currentNumberInput ? ` (${this.currentNumberInput})` : '';
        const navInfo = `${colors.bright}${colors.cyan}🎮 NAV:${colors.reset} ${colors.yellow}↑↓${colors.reset}Mover ${colors.yellow}ENTER${colors.reset}Ejecutar ${colors.yellow}1-20${colors.reset}Directo${currentInputDisplay} ${colors.yellow}H${colors.reset}Ayuda ${colors.yellow}X${colors.reset}Salir`;
        const selectedInfo = `${colors.dim}Seleccionado: ${colors.bright}${colors.green}${selectedOption.title}${colors.reset}`;
        
        console.log(`\n${navInfo}`);
        console.log(selectedInfo);
    }

    // Manejar teclas presionadas
    handleKeyPress(key) {
        if (!this.isRunning) return;

        const keyStr = key.toString();
        
        // Detectar secuencias de escape para flechas
        if (keyStr === '\u001b[A') { // Flecha arriba
            this.currentSelection = (this.currentSelection - 1 + this.menuOptions.length) % this.menuOptions.length;
            this.showMainMenu();
            return;
        }
        
        if (keyStr === '\u001b[B') { // Flecha abajo
            this.currentSelection = (this.currentSelection + 1) % this.menuOptions.length;
            this.showMainMenu();
            return;
        }
        
        if (keyStr === '\r' || keyStr === '\n') { // Enter
            this.executeSelectedOption();
            return;
        }
        
        if (keyStr.toLowerCase() === 'h') { // Ayuda
            this.showHelp();
            return;
        }
        
        if (keyStr.toLowerCase() === 'x' || keyStr === '\u0003') { // Salir o Ctrl+C
            this.exit();
            return;
        }
        
        // Manejar números (incluyendo múltiples dígitos)
        const trimmedKey = keyStr.trim();
        if (/^\d$/.test(trimmedKey)) {
            this.handleNumberInput(trimmedKey);
            this.showMainMenu(); // Actualizar display con número ingresado
            return;
        }
    }

    // Ejecutar comando con progreso visual
    async executeCommand(command, description) {
        this.clearScreen();
        
        const topBorder = '╔' + '═'.repeat(this.frameWidth - 2) + '╗';
        const bottomBorder = '╚' + '═'.repeat(this.frameWidth - 2) + '╝';
        
        console.log(`${colors.white}${colors.bright}${topBorder}`);
        console.log(this.createFixedLine('🔄 EJECUTANDO PROCESO', 'center'));
        console.log(this.createFixedLine(''));
        console.log(this.createFixedLine(`${colors.blue}📋 DESCRIPCIÓN:${colors.white}`));
        console.log(this.createFixedLine(`${colors.yellow}${description}${colors.white}`));
        console.log(this.createFixedLine(''));
        console.log(this.createFixedLine(`${colors.blue}💻 COMANDO:${colors.white}`));
        console.log(this.createFixedLine(`${colors.gray}${command}${colors.white}`));
        console.log(this.createFixedLine(''));
        console.log(`${bottomBorder}${colors.reset}`);
        
        return new Promise((resolve) => {
            const child = spawn(command, { shell: true, stdio: 'inherit' });
            
            child.on('close', (code) => {
                console.log(`\n${colors.white}${colors.bright}${topBorder}`);
                if (code === 0) {
                    console.log(this.createFixedLine(`${colors.green}✅ PROCESO COMPLETADO EXITOSAMENTE${colors.white}`, 'center'));
                } else {
                    console.log(this.createFixedLine(`${colors.red}❌ PROCESO FALLÓ (Código: ${code})${colors.white}`, 'center'));
                }
                console.log(`${bottomBorder}${colors.reset}`);
                this.pauseForUser();
                resolve();
            });
        });
    }

    // Pausa para que el usuario vea el resultado
    pauseForUser() {
        console.log(`\n${colors.yellow}Presiona cualquier tecla para continuar...${colors.reset}`);
        
        // Remover listener temporal
        const tempListener = () => {
            process.stdin.removeListener('data', tempListener);
            this.showMainMenu();
        };
        
        process.stdin.once('data', tempListener);
    }

    // Mostrar ayuda
    showHelp() {
        this.clearScreen();
        
        const topBorder = '╔' + '═'.repeat(this.frameWidth - 2) + '╗';
        const bottomBorder = '╚' + '═'.repeat(this.frameWidth - 2) + '╝';
        
        console.log(`${colors.white}${colors.bright}${topBorder}`);
        console.log(this.createFixedLine('📖 GUÍA DE USO - TODOGRAM TV', 'center'));
        console.log(this.createFixedLine(''));
        
        const helpContent = [
            `${colors.cyan}🎯 PROPÓSITO DEL SISTEMA${colors.white}`,
            'Sistema completo de gestión para tu repositorio.',
            '',
            `${colors.green}🎮 CONTROLES${colors.white}`,
            '• ↑ ↓ - Navegar opciones',
            '• ENTER - Ejecutar seleccionada',
            '• 1-20 - Seleccionar directo (ej: 1, 15, 20)',
            '• H - Ayuda',
            '• X - Salir',
            '',
            `${colors.yellow}💡 NÚMEROS MÚLTIPLES DÍGITOS${colors.white}`,
            'Para opciones 10-20: escribe el número completo',
            'Ejemplo: "1" "0" para opción 10',
            'Ejemplo: "2" "0" para opción 20',
            '',
            `${colors.magenta}📊 CATEGORÍAS${colors.white}`,
            `${colors.green}🚀 PRINCIPALES (1-4)${colors.white} - Operaciones diarias`,
            `${colors.magenta}🌐 DEPLOY (5-8)${colors.white} - Despliegue`,
            `${colors.blue}🛠️ PM2 (9-12)${colors.white} - Gestión procesos`,
            `${colors.cyan}⚙️ DEV (13-16)${colors.white} - Desarrollo`,
            `${colors.red}🧹 CLEAN (17-20)${colors.white} - Mantenimiento`
        ];
        
        helpContent.forEach(line => {
            console.log(this.createFixedLine(line));
        });
        
        console.log(this.createFixedLine(''));
        console.log(`${bottomBorder}${colors.reset}`);
        this.pauseForUser();
    }

    // Ejecutar opción seleccionada
    async executeSelectedOption() {
        const option = this.menuOptions[this.currentSelection];
        await this.executeCommand(option.command, option.title);
    }

    // Iniciar el menú
    start() {
        this.isRunning = true;
        this.setupKeyboardNavigation();
        this.showMainMenu();
    }

    // Salir del programa
    exit() {
        this.clearScreen();
        
        const topBorder = '╔' + '═'.repeat(this.frameWidth - 2) + '╗';
        const bottomBorder = '╚' + '═'.repeat(this.frameWidth - 2) + '╝';
        
        console.log(`${colors.white}${colors.bright}${topBorder}`);
        console.log(this.createFixedLine(''));
        console.log(this.createFixedLine('🎬 GRACIAS POR USAR TODOGRAM TV 🎬', 'center'));
        console.log(this.createFixedLine(''));
        console.log(this.createFixedLine(`${colors.yellow}¡Sistema cerrado correctamente!${colors.white}`, 'center'));
        console.log(this.createFixedLine(''));
        console.log(`${bottomBorder}${colors.reset}`);
        
        this.isRunning = false;
        
        // Limpiar listeners y timeouts
        if (this.numberInputTimeout) {
            clearTimeout(this.numberInputTimeout);
        }
        
        process.stdin.removeAllListeners('data');
        
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(false);
        }
        
        this.rl.close();
        process.exit(0);
    }
}

// Inicializar el menú
const menu = new TodogramMenu();

// Manejar Ctrl+C
process.on('SIGINT', () => {
    menu.exit();
});

// Manejar cierre inesperado
process.on('SIGTERM', () => {
    menu.exit();
});

menu.start();

export default TodogramMenu;
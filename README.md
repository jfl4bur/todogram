
<p align="center">
  <a href="https://github.com/jfl4bur/Todogram">
    <img src="https://img.shields.io/github/contributors/jfl4bur/Todogram.svg?style=for-the-badge" alt="Contributors" />
    <img src="https://img.shields.io/github/forks/jfl4bur/Todogram.svg?style=for-the-badge" alt="Forks" />
    <img src="https://img.shields.io/github/stars/jfl4bur/Todogram.svg?style=for-the-badge" alt="Stargazers" />
    <img src="https://img.shields.io/github/issues/jfl4bur/Todogram.svg?style=for-the-badge" alt="Issues" />
    <img src="https://img.shields.io/github/license/jfl4bur/Todogram.svg?style=for-the-badge" alt="License" />
    <img src="https://img.shields.io/badge/LinkedIn--blue?style=for-the-badge&logo=linkedin" alt="LinkedIn" />
  </a>
</p>

<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/othneildrew/Best-README-Template">
    <img src="images/logo.png" alt="Logo" width="180" height="180">
  </a>

  <h3 align="center">Script Películas / series</h3>

  <p align="center">
    ¡Una fantástica documentación para impulsar tus proyectos!
    <br />
    <a href="https://github.com/othneildrew/Best-README-Template"><strong>Explora la documentación »</strong></a>
    <br />
    <br />
    <a href="https://jfl4bur.github.io/Todogram/">Ver Demo</a>
    &middot;
    <a href="https://github.com/jfl4bur/Todogram/issues/new?labels=bug&template=bug-report---.md">Informar de un ERROR</a>
    &middot;
    <a href="https://github.com/jfl4bur/Todogram/issues/new?labels=enhancement&template=feature-request---.md">Solicitar Función</a>
  </p>
</div>
<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

### Construido con

Esta sección debe enumerar los principales frameworks/bibliotecas utilizados para el arranque de su proyecto. Deje los complementos/plugins para la sección de agradecimientos. Aquí tiene algunos ejemplos.

* [![Node.js][Node.js]][Node-url]
* [![JavaScript][JavaScript.com]][JavaScript-url]
* [![GitHub Actions][GitHub-Actions]][GitHub-Actions-url]
* [![Notion API][Notion-API]][Notion-API-url]
* [![TMDb API][TMDb-API]][TMDb-API-url]

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

## Tabla de contenidos 📚

- [Descripción general](#descripción-general-)
- [Requisitos](#requisitos-)
- [Instalación local](#instalación-local-)
- [Uso en GitHub Actions](#uso-en-github-actions-)
- [Estructura de archivos](#estructura-de-archivos-)
- [Explicación técnica del funcionamiento](#explicación-técnica-del-funcionamiento-)
- [Errores y soluciones](#errores-y-soluciones-)
- [FAQ - Preguntas frecuentes](#faq---preguntas-frecuentes-)
- [Datos de interés](#datos-de-interés-)
- [Agradecimientos](#agradecimientos-)

## Descripción general 📖

Este proyecto proporciona un conjunto de scripts y configuraciones para extraer, sincronizar y enriquecer datos de películas y series desde una base de datos Notion y la API de TMDb. El objetivo principal es crear un archivo JSON con la información consolidada y utilizarlo en aplicaciones web (como clones de Rakuten.tv) para mostrar contenido actualizado y detallado.

Incluye soporte para:
- Extracción de datos desde Notion (títulos, géneros, sinopsis, carteles, etc.)
- Enriquecimiento de datos desde TMDb cuando faltan datos en Notion.
- Uso de GitHub Actions para automatizar la sincronización y generación del archivo JSON.
- Optimización y control detallado de procesos con barras de progreso y registros en consola.
- Prioridad en los datos manuales de Notion para preservar correcciones y personalizaciones.

## Requisitos 🛠️

- Node.js (v16 o superior recomendado)
- Cuenta en Notion con acceso a la base de datos que contiene los datos
- Token de integración API de Notion
- API Key de TMDb (The Movie Database)
- GitHub con repositorio configurado para usar GitHub Actions (opcional para automatización)
- Conocimientos básicos de Git y línea de comandos (para instalación y despliegue local)

## Instalación local 🖥️

1. Clona este repositorio:
   ```bash
   git clone https://github.com/jfl4bur/Todogram.git
   cd Todogram
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   Crea un archivo `.env` en la raíz con el siguiente contenido:
   ```
   NOTION_TOKEN=tu_token_notion
   NOTION_DATABASE_ID=tu_id_base_de_datos
   TMDB_API_KEY=tu_api_key_tmdb
   ```

4. Ejecuta el script principal para extraer y generar el archivo `data.json`:
   ```bash
   node main.js
   ```

5. Revisa el archivo generado en `data.json`. Este contiene toda la información sincronizada.

## Uso en GitHub Actions 🤖

Para automatizar la actualización del archivo `data.json` y sincronizar cambios:

1. Copia el archivo `.github/workflows/sync.yml` (o crea uno similar) en tu repositorio.

2. Añade los secretos en GitHub (`Settings > Secrets`) con los nombres:
   - `NOTION_TOKEN`
   - `NOTION_DATABASE_ID`
   - `TMDB_API_KEY`

3. Cada vez que hagas push o con la periodicidad configurada, GitHub Actions ejecutará el workflow que:
   - Extrae datos desde Notion.
   - Consulta TMDb para completar datos faltantes.
   - Actualiza el archivo JSON en el repositorio automáticamente.

4. Puedes revisar los logs de ejecución desde la pestaña Actions en GitHub.

## Estructura de archivos 📂

```
/Todogram
│
├── main.js               # Script principal para extracción y generación de data.json
├── auto-push.js          # Script auxiliar para gestión avanzada de git push
├── data.json             # Archivo generado con los datos consolidados
├── .env.example          # Ejemplo de configuración de variables de entorno
├── package.json          # Configuración de proyecto Node.js
├── .github/
│   └── workflows/
│       └── sync.yml      # Configuración GitHub Actions para automatización
└── README.md             # Esta documentación
```

## Explicación técnica del funcionamiento 🔧

- **main.js**  
  Este archivo contiene el código para conectar con Notion API y extraer toda la información relevante de la base de datos (títulos, géneros, sinopsis, imágenes, etc.).  
  Luego consulta la API de TMDb para obtener datos adicionales o rellenar campos faltantes.  
  Prioriza siempre los datos de Notion para mantener correcciones manuales.  
  Muestra barras de progreso estilizadas y mensajes detallados en la consola para seguimiento.  
  Finalmente, guarda toda la información consolidada en un archivo JSON (`data.json`).

- **auto-push.js**  
  Script para facilitar el proceso de subir cambios a GitHub cuando ocurren conflictos de push.  
  Proporciona un menú interactivo para seleccionar cómo resolver conflictos y comandos git útiles.

- **sync.yml**  
  Archivo de configuración para GitHub Actions que automatiza el proceso de extracción y actualización del JSON en el repositorio.  
  Define los eventos de disparo (push, cron) y los pasos necesarios para ejecutar `main.js` en un entorno de CI.

- **data.json**  
  Archivo generado que contiene la base de datos consolidada para usar en la app web Softr o cualquier frontend que consuma esta información.

## Errores y soluciones ❌➡️✅

- **Error: Token de Notion inválido o base de datos no encontrada**  
  Verifica que tu token y ID de base de datos estén correctamente configurados en `.env` o en los secretos de GitHub.

- **Error: Límite de API de Notion excedido**  
  El script usa pausas y optimizaciones para evitarlo, pero si tienes muchos datos, puede ser necesario aumentar los tiempos o dividir la base de datos.

- **Error: API de TMDb no responde o key inválida**  
  Revisa tu clave TMDb y el límite de uso diario. Asegúrate de que tu cuenta TMDb esté activa.

- **Conflictos al hacer push en GitHub**  
  Usa `auto-push.js` para resolver de forma interactiva los conflictos de git.

## FAQ - Preguntas frecuentes ❓

**Q1: ¿Puedo usar este proyecto sin GitHub Actions?**  
Sí, puedes ejecutar el script localmente y subir manualmente el archivo `data.json`.

**Q2: ¿Qué hago si un campo no se actualiza?**  
Revisa que el campo exista en Notion y que el script tenga permisos. También verifica que la API de TMDb tenga datos para ese ítem.

**Q3: ¿Puedo modificar la base de datos en Notion?**  
Sí, los cambios se reflejarán en la próxima sincronización.

**Q4: ¿Se puede integrar con otras APIs?**  
Actualmente solo está diseñado para TMDb y Notion, pero el código es extensible.

## Datos de interés ℹ️

- El proyecto prioriza datos manuales de Notion para mantener personalizaciones.  
- Las imágenes (portadas y carteles) se extraen preferentemente de Notion y como respaldo de TMDb.  
- La barra de progreso usa caracteres Unicode para visualización clara en consola.  
- El workflow está pensado para evitar exceder límites de API y manejo eficiente de grandes bases de datos.

## Agradecimientos 🙏

- A la comunidad de Notion API por su excelente documentación.  
- Al equipo de TMDb por proveer una API robusta para datos multimedia.  
- A los desarrolladores de GitHub Actions por permitir automatizar flujos CI/CD.  
- A todos los colaboradores que han aportado a este proyecto.

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

<!-- Referencias de badges -->
[Node.js]: https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/
[JavaScript.com]: https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[JavaScript-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
[GitHub-Actions]: https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white
[GitHub-Actions-url]: https://github.com/features/actions
[Notion-API]: https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white
[Notion-API-url]: https://developers.notion.com/
[TMDb-API]: https://img.shields.io/badge/TMDb-01D277?style=for-the-badge&logo=themoviedatabase&logoColor=white
[TMDb-API-url]: https://www.themoviedb.org/documentation/api

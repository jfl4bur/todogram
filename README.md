<a id="readme-top"></a>
<!-- LOGOTIPO DEL PROYECTO -->
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
<!-- PROJECT LOGO -->
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


### Construido con

Esta sección debe enumerar los principales frameworks/bibliotecas utilizados para el arranque de su proyecto. Deje los complementos/plugins para la sección de agradecimientos. Aquí tiene algunos ejemplos.

* [![Siguiente][Siguiente.js]][Siguiente-url]
* [![React][React.js]][URL de React]
* [![Vue][Vue.js]][URL de Vue]
* [![Angular][Angular.io]][URL de Angular]
* [![Svelte][Svelte.dev]][URL de Svelte]
* [![Laravel][Laravel.com]][URL de Laravel]
* [![Bootstrap][Bootstrap.com]][URL de Bootstrap]
* [![JQuery][JQuery.com]][URL de JQuery]

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

# Uso 🚀
Subir a Github

```
git add .
```
```
git commit -m "✅ Actualización: documentación de main.js, data.json y workflow"
```
```
git push origin main
```

# 🎬 Clon de Rakuten.tv – Softr + Notion + TMDB + GitHub Actions

Este proyecto es un clon funcional de la interfaz de Rakuten.tv, creado con [Softr](https://www.softr.io/), usando una base de datos en [Notion](https://www.notion.so/) como backend de contenido, y enriquecido automáticamente con datos de [TMDB (The Movie Database)](https://www.themoviedb.org/). GitHub Actions se usa para automatizar la extracción y combinación de datos, y publicar un archivo `data.json` que alimenta la web.

---

## 📁 Estructura del Proyecto

```
📂 .github/workflows
    └── update-data.yml       # Workflow de GitHub Actions para generar data.json
📂 scripts
    └── fetch-and-merge.js    # Script principal de extracción y fusión Notion + TMDB
📂 public
    └── data.json             # Archivo generado automáticamente con todos los datos
📄 .env                       # Variables de entorno (local)
📄 README.md                  # Este archivo
```

---

## ⚙️ Requisitos

- Cuenta en Notion con base de datos estructurada.
- API Key de Notion.
- API Key de TMDB.
- Node.js 18 o superior.
- Cuenta de GitHub con GitHub Actions habilitado.
- (Opcional) Vercel o Netlify para servir la web.
- Softr para consumir `data.json` y mostrar los carruseles.

---

## 🔧 Instalación Local

1. **Clona este repositorio**

```bash
git clone https://github.com/jfl4bur/Todogram.git
cd Todogram
```

2. **Instala dependencias**

```bash
npm install
```

3. **Configura las variables de entorno**

Crea un archivo `.env` en la raíz con el siguiente contenido:

```env
NOTION_API_KEY=secret_xxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxx
TMDB_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

4. **Ejecuta el script para generar `data.json`**

```bash
node scripts/fetch-and-merge.js
```

5. **Verifica el archivo generado**

El archivo `public/data.json` contendrá todos los datos listos para que Softr los consuma.

---

## 🚀 Uso con GitHub Actions

Este proyecto incluye un workflow (`.github/workflows/update-data.yml`) que:

- Se ejecuta automáticamente al hacer push a `main` o manualmente.
- Extrae los datos de Notion.
- Los enriquece automáticamente con TMDB (si hay campos vacíos).
- Genera un archivo `public/data.json`.
- Hace commit del `data.json` actualizado al repositorio.

### 🧪 Ejecutar manualmente en GitHub

1. Ve a la pestaña **Actions** de tu repo.
2. Selecciona **"Update Data"**.
3. Haz clic en **Run workflow**.

### 🔐 Variables en GitHub Actions

Guarda las siguientes variables como *Secrets* en tu repositorio (`Settings > Secrets > Actions`):

- `NOTION_API_KEY`
- `NOTION_DATABASE_ID`
- `TMDB_API_KEY`

---

## 🧠 Explicación Técnica

### Objetivo

Automatizar la sincronización de datos entre una base de datos en Notion y TMDB, y exponer esa información en formato JSON para que Softr renderice un clon funcional de Rakuten.tv, incluyendo:

- Título
- Sinopsis
- Géneros
- Año
- Puntuación
- Trailer
- Audios
- Subtítulos
- Carteles
- Portada
- Países, director, actores, etc.

### ¿Qué hace el script `fetch-and-merge.js`?

1. **Lee los datos de la base de datos de Notion** usando la API oficial.
2. **Por cada entrada**, revisa qué campos faltan (por ejemplo, sinopsis, póster, géneros).
3. Si falta información, **consulta la API de TMDB** usando el `ID TMDB` del ítem.
4. Completa los campos faltantes con los datos de TMDB.
5. Crea un objeto completo con todos los campos estructurados.
6. Escribe todo en `public/data.json`.

### ¿Qué hace el workflow de GitHub Actions?

- Usa Node.js y el script anterior para generar `data.json`.
- Se asegura de que esté actualizado automáticamente en el repositorio.
- Esto permite a Softr consumir siempre el JSON más reciente desde:

```
https://jfl4bur.github.io/Todogram/data.json
```

Este enlace debe ser configurado como fuente de datos en Softr.

---

## 🌐 Frontend en Softr

1. Crea un bloque de carrusel personalizado con HTML/CSS/JS en Softr.
2. Conecta tu fuente externa con el JSON generado (`data.json`).
3. Usa JavaScript para renderizar dinámicamente el carrusel estilo Rakuten.tv.
4. Usa efectos de hover, modales, sinopsis extendida y filtros por género/categoría como en Rakuten.tv.

---

## 📝 Notas

- Puedes modificar el script para adaptarlo a nuevas propiedades de tu base de datos.
- TMDB permite muchas consultas, pero ten cuidado con los límites de API si tu base de datos es muy grande.
- Puedes usar Vercel o Netlify para servir directamente el `data.json` con cache control.

---

## 📄 Licencia

Este proyecto es de uso privado. Si deseas usarlo o adaptarlo para distribución pública, respeta los términos de uso de Notion, TMDB y Softr.




## Autores
| [<img src="https://avatars.githubusercontent.com/u/74684004?v=4" width=115><br><sub>@Todogram</sub>](https://github.com/jfl4bur) |
| :---: | :---: | :---: |



<!-- ENLACES E IMÁGENES DE MARKDOWN -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[escudo de colaboradores]: https://img.shields.io/github/contributors/othneildrew/Best-README-Template.svg?style=for-the-badge
[URL de los colaboradores]: https://github.com/othneildrew/Best-README-Template/graphs/contributors
[tenedores-escudo]: https://img.shields.io/github/forks/othneildrew/Best-README-Template.svg?style=for-the-badge
[url de la bifurcación]: https://github.com/othneildrew/Best-README-Template/network/members
[estrellas-escudo]: https://img.shields.io/github/stars/othneildrew/Best-README-Template.svg?style=for-the-badge
[URL de estrellas]: https://github.com/othneildrew/Best-README-Template/stargazers
[Problemas-escudo]: https://img.shields.io/github/issues/othneildrew/Best-README-Template.svg?style=for-the-badge
[url de problemas]: https://github.com/othneildrew/Best-README-Template/issues
[licencia-escudo]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[URL de la licencia]: https://github.com/othneildrew/Best-README-Template/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/othneildrew
[captura de pantalla del producto]: imágenes/captura de pantalla.png
[Siguiente.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Siguiente URL]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[URL de React]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[URL angular]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[URL de Svelte]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[URL de Laravel]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[URL de Bootstrap]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[URL de JQuery]: https://jquery.com

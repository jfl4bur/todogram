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
<br />
<div align="center">
  <a href="https://github.com/othneildrew/Best-README-Template">
    <img src="images/logo.png" alt="Logo" width="180" height="180">
  </a>

  <h3 align="center">Script Películas / series</h3>

  <p align="center">
    An awesome README template to jumpstart your projects!
    <br />
    <a href="https://github.com/othneildrew/Best-README-Template"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/othneildrew/Best-README-Template">View Demo</a>
    &middot;
    <a href="https://github.com/othneildrew/Best-README-Template/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/othneildrew/Best-README-Template/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

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

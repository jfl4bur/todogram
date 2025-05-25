Elimina todo y reinstala:

powershell
Remove-Item -Recurse -Force node_modules, package-lock.json, .vercel -ErrorAction SilentlyContinue
npm install @vercel/node@3.0.0 node-fetch@3.3.2 cors@2.8.5
Configura variables de entorno en Vercel:

NOTION_API_KEY: Tu clave de API de Notion

NOTION_DATABASE_ID: ID de tu base de datos

Despliega con configuración limpia:

powershell
vercel --force --prod

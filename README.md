Elimina todo y reinstala:

# 1. Limpieza completa
Remove-Item -Recurse -Force node_modules, package-lock.json, .vercel -ErrorAction SilentlyContinue

# 2. Instalar dependencias específicas
npm install @vercel/node@3.0.0 node-fetch@3.3.2 cors@2.8.5

# 3. Desplegar con confirmación automática
vercel --force --prod --yes

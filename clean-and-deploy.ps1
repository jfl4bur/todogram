Write-Host "Limpiando proyecto..."
Remove-Item -Recurse -Force .vercel, node_modules, package-lock.json -ErrorAction SilentlyContinue

Write-Host "Instalando dependencias..."
npm install

Write-Host "Desplegando en Vercel..."
vercel --force --prod

Write-Host "Proceso completado!"
git add public/data.json
$fecha = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Auto push tras guardar data.json [$fecha]"
git pull origin main --rebase
git push origin main

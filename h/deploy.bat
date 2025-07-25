@echo off
echo Deploying to Vercel...
cd /d C:\Users\hp\swapin
git add .
git commit -m "Quick update %date% %time%"
git push
echo Deployment started! Check Vercel dashboard.
pause
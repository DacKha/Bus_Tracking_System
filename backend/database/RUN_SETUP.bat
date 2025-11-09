@echo off
echo ========================================
echo   SETUP DATABASE THUC TE
echo ========================================
echo.
echo Dang chay setup database...
echo.

cd /d "%~dp0"

echo Nhap password MySQL cua ban:
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < setup-realistic.sql

echo.
echo ========================================
echo   HOAN THANH!
echo ========================================
echo.
echo Thong tin dang nhap:
echo - Admin: admin@ssb.com / admin123
echo - Driver: taixe1@ssb.com / driver123
echo - Parent: phuhuynh1@ssb.com / parent123
echo.
pause

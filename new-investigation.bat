@echo off
REM New Investigation Generator for Windows
REM Usage: new-investigation.bat engineering distributed-systems "Distributed Systems Design"

if "%~3"=="" (
    echo Usage: new-investigation.bat ^<area^> ^<topic^> "^<Title^>"
    echo Example: new-investigation.bat engineering distributed-systems "Distributed Systems Design"
    exit /b 1
)

setlocal enabledelayedexpansion

set AREA=%~1
set TOPIC=%~2
set TITLE=%~3

set DIR=content\investigations\%AREA%
set FILE=%DIR%\%TOPIC%.md

if not exist "%DIR%" mkdir "%DIR%"

if exist "%FILE%" (
    echo File already exists: %FILE%
    exit /b 1
)

REM Get current date in DD-Month-YYYY format
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do (
    set MM=%%a
    set DD=%%b
    set YYYY=%%c
)

REM Convert month number to name
setlocal
if "%MM%"=="01" set MONTH=January
if "%MM%"=="02" set MONTH=February
if "%MM%"=="03" set MONTH=March
if "%MM%"=="04" set MONTH=April
if "%MM%"=="05" set MONTH=May
if "%MM%"=="06" set MONTH=June
if "%MM%"=="07" set MONTH=July
if "%MM%"=="08" set MONTH=August
if "%MM%"=="09" set MONTH=September
if "%MM%"=="10" set MONTH=October
if "%MM%"=="11" set MONTH=November
if "%MM%"=="12" set MONTH=December

set DATE_STR=%DD%-%MONTH%-%YYYY%
set CREATED=%YYYY%-%MM%-%DD%

(
    echo ---
    echo title: "%TITLE%"
    echo created: %CREATED%
    echo status: "Seed"
    echo areas: ["%AREA%"]
    echo topics: [""]
    echo questions:
    echo   - ""
    echo tags: []
    echo related: []
    echo draft: false
    echo ---
    echo.
    echo ## %DATE_STR%
    echo.
    echo Initial thoughts...
    echo.
) > "%FILE%"

echo Created new investigation: %FILE%
echo Edit the file and add your initial questions and thoughts.

endlocal

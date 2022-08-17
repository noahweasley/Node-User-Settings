@echo off
git log --pretty="- %%s" > temp.txt
SET /p message = < temp.txt
echo %message%
del temp.txt

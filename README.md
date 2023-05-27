# Agenda

![](https://github.com/0x10-z/nextjs-agenda/actions/workflows/master.yml/badge.svg)

## Backend API doc

[http://localhost:5000/docs](http://localhost:5000/docs)

## Deploy App

```sh
current_date=$(date +'%y.%m.%d-%H%M%S')
echo REACT_APP_API_URL=http://localhost:5000/ > ./frontend/.env.local
echo REACT_APP_VERSION=$current_date >> ./frontend/.env.local
echo APP_VERSION=$current_date > ./backend/.env
echo DB_DEFAULT_USER=USER >> ./backend/.env
echo DB_DEFAULT_PASS=USER >> ./backend/.env
docker-compose up
```

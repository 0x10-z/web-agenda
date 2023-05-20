# Agenda

## Backend API doc

[http://localhost:5000/docs](http://localhost:5000/docs)

## Deploy NextJS

```sh
current_date=$(date +'%y.%m.%d-%H%M%S')
echo NEXT_PUBLIC_APP_VERSION=$current_date > .env.local
docker-compose up
```

# NextJS Agenda

## Deploy NextJS

```sh
current_date=$(date +'%y.%m.%d-%H%M%S')
echo NEXT_PUBLIC_APP_VERSION=$current_date > .env.local
docker-compose up
```

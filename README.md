### Установка
```sh
$ mkdir <project name>
$ cd <project name>
$ git init
$ git remote add origin git@rscz.ru:pojidaev/gulp-frontend.git
$ git pull origin master
$ git remote rm origin
$ git checkout -b develop
$ yarn install
```

### Команды gulp
```sh
$ gulp dev		<--- для разработки
$ gulp build 	<--- для сборки 
$ gulp deploy	<--- для деплоя ( предварительно установив доступы )
```
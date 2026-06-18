# multiplayer-arena

https://multiplayer-arena-5.onrender.com

№3 - ПОДКЛЮЧЕНИЕ ДБ И ДЕПОЙ НА RENDER

ШАГ1 подготовка проекта к деплою. 

-------------------------------------------------------------------------
```
multiplayer-arena/
├── client/                 # Клиентская часть (Vite + Three.js)
│   ├── src/
│   │   ├── config/
│   │   │   └── network.js
│   │   ├── core/
│   │   │   ├── Game.js
│   │   │   └── NetworkManager.js
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── server/                 # Серверная часть (Express + Socket.IO)
│   ├── src/
│   │   ├── routes/
│   │   │   └── auth.js
│   │   ├── database/
│   │   │   └── database.js
│   │   ├── socket/
│   │   │   └── index.js
│   │   └── ...
│   ├── index.js
│   └── package.json
├── package.json            # Корневой package.json
└── .gitignore
```
-------------------------------------------------------------------------

ШАГ2 в package.json  Установка всех зависимостей проекта.
На Render нет папки node_modules, при деплое нужно установить все пакеты с нуля.
Этот скрипт делает всё одной командой, без него необходтио зпходить в каждый файл

{
  "name": "multiplayer-arena",
  "scripts": {
    "install:all": "npm install && cd client && npm install && cd ../server && npm install",
    "build": "cd client && npm run build",
    "start": "cd server && npm start"
  }
}


ШАГ3 Создание PostgreSQL БД и Web Service на Render.
назвав бд - arena-db и выбрав бесплатный тариф я перешла на сервис.
Необходимо заполнить форму и проект. 
заполнить поля:

-1- Build Command --> npm install && cd client && npm install && npm run build && cd ../server && npm install

-2- Start Command --> cd server && npm start

ШАГ4: Настройка переменных окружения

перейдя в вкладку - Environment нелбходимо настроить переменные среды, чтоб render мог считывать эти значения из код.
Добавлены все переменные окружения:
1. DATABASE_URL
2. NODE_ENV
3. PORT
4. JWT_SECRET
5. CLIENT_URL

МОИ ошибки и решения -

1 Ошибка: ECONNREFUSED или localhost:3000
Причина: Клиент подключается к localhost вместо Render
Решение:
// client/src/config/network.js
export const SOCKET_URL = window.location.origin;


2 Ошибка: Database initialization error
Причины:
Не установлена переменная DATABASE_URL

мое решение:
DATABASE_URL установлена в Environment












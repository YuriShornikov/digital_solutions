# Развёртывание проекта на сервере REG.RU

## 1. Подготовка сервера

Установить необходимые пакеты:

```bash
sudo apt update
sudo apt install nginx
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

---

## 2. Клонирование проекта

Склонировать проект в домашнюю директорию:

```bash
cd /root/
git clone https://github.com/your-repo/digital_solutions.git
```

---

## 3. Настройка Backend (Express.js)

Перейти в папку backend:

```bash
cd /root/digital_solutions/backend
```

Установить зависимости:

```bash
npm install
```

Запустить backend сервер через PM2:

```bash
pm2 start index.js --name digital-backend
pm2 save
pm2 startup
```

---

## 4. Настройка Frontend (Vite)

Перейти в папку frontend:

```bash
cd /root/digital_solutions/frontend
```

Перед сборкой:
- Убедитесь, что обращения к API идут через `/api/`, а не напрямую на `localhost`.

При необходимости создать файл `.env.production`:

```bash
VITE_API_URL=/api/
```

Собрать фронтенд:

```bash
npm install
npm run build
```

---

## 5. Перемещение собранного фронтенда

Создать директорию для фронтенда и переместить туда папку `dist`:

```bash
sudo mkdir -p /var/www/frontend
sudo mv /root/digital_solutions/frontend/dist /var/www/frontend/
```

Выставить права:

```bash
sudo chown -R www-data:www-data /var/www/frontend/dist
sudo chmod -R 755 /var/www/frontend/dist
```

---

## 6. Настройка Nginx

Открыть файл конфигурации сайта:

```bash
sudo nano /etc/nginx/sites-available/default
```

И заменить его содержимое на:

```nginx
server {
    listen 80;
    server_name 193.227.241.62;

    root /var/www/frontend/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location = /favicon.ico {
        access_log off;
        log_not_found off;
        root /var/www/frontend/dist;
    }

    location /static/ {
        root /var/www/frontend/dist;
    }

    location /api/ {
        proxy_pass http://localhost:3001/;
        rewrite ^/api/(.*)$ /$1 break;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Проверить синтаксис:

```bash
sudo nginx -t
```

Перезагрузить nginx:

```bash
sudo systemctl reload nginx
```

---

## 7. Проверка работы


Открыть браузер и перейти по адресу:

```
http://193.227.241.62/
```


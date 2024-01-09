if ! command -v npm &> /dev/null
then
    apt-get install -y npm
fi

npm install express

if ! command -v nginx &> /dev/null
then
    apt-get install -y nginx
fi

if ! command -v certbot &> /dev/null
then
    apt-get install -y certbot python3-certbot-nginx
fi

if ! command -v pike &> /dev/null

then
    apt-get install -y pike8.0
fi

if [ ! -f /etc/letsencrypt/live/code.abdellahi.tech/fullchain.pem ]; then
    certbot --nginx -d code.abdellahi.tech -d www.code.abdellahi.tech --non-interactive --agree-tos -m
fi

if [ ! -L /etc/nginx/sites-enabled/code.abdellahi.tech ]; then
    rm -rf /etc/nginx/sites-enabled/*
    cp /home/ubuntu/code.abdellahi.tech /etc/nginx/sites-available
    ln -s /etc/nginx/sites-available/code.abdellahi.tech /etc/nginx/sites-enabled
    service nginx restart
fi

pm2 start npm -- start
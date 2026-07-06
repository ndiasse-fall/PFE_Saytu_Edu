# Utiliser l'image PHP 8.2 officielle avec le serveur Apache
FROM php:8.2-apache

# Installer les dépendances système requises par Laravel
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Activer le module de réécriture d'Apache (indispensable pour les routes Laravel)
RUN a2enmod rewrite

# Définir le dossier de travail dans le conteneur
WORKDIR /var/www/html

# Copier tous les fichiers du backend dans le conteneur
COPY . .

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Installer les dépendances PHP de Laravel
RUN composer install --no-dev --optimize-autoloader

# Donner les bonnes permissions aux dossiers de cache et de stockage
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Indiquer à Apache que le point d'entrée est le dossier "public" de Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Exposer le port 80 pour Render
EXPOSE 80
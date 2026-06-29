# Etapa 1: Compilar la aplicación Angular
FROM node:20 AS build
WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código y compilar para producción
COPY . .
RUN npm run build -- --configuration production

# Etapa 2: Servir la aplicación usando Nginx
FROM nginx:alpine

# Eliminar los archivos por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar el archivo de configuración personalizado de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos generados al directorio de Nginx
# Angular 17+ con el builder @angular/build:application coloca la salida en dist/<project-name>/browser
COPY --from=build /app/dist/hotel-reservas-frontend/browser /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

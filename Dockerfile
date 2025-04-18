# Etapa 1: Build
# Usa una imagen base de Node.js para crear el proyecto
FROM node:18 AS build

# Definir el directorio de trabajo
WORKDIR /app

# Copiar los archivos package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar todo el código fuente del proyecto
COPY . .

# Crear el build del proyecto React (construir la aplicación para producción)
RUN npm run build

# Etapa 2: Servir la aplicación
# Usamos una imagen de Nginx para servir la aplicación ya construida
FROM nginx:alpine

# Copiar el contenido de la carpeta build generada en la etapa anterior al directorio de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Exponer el puerto 3000
EXPOSE 3000

# Ejecutar Nginx en primer plano para servir el contenido
CMD ["nginx", "-g", "daemon off;"]

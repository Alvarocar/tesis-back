# Imagen base con Node.js
FROM node:20-alpine AS builder

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos del proyecto
COPY pnpm-lock.yaml package.json ./

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Instalar las dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación
RUN pnpm build

# Imagen final para producción
FROM node:20-alpine

WORKDIR /app

# Instalar solo las dependencias de producción
COPY --from=builder /app/pnpm-lock.yaml /app/package.json ./
# Instalar pnpm globalmente
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile

# Copiar la carpeta de distribución
COPY --from=builder /app/dist ./dist

# Exponer el puerto del servidor
EXPOSE 3000

# Comando de inicio
CMD ["npm", "run", "start:raw"]
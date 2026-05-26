Pasos para arrancar el proyecto:

1. Tener instalado Node.js y XAMPP con MariaDB activo.

2. Importar la base de datos:
   - Abrir phpMyAdmin (http://localhost/phpmyadmin)
   - Crear una base de datos llamada "rehabilitacion_ictus"
   - Importar el archivo tfg_rehabilitacion.sql

3. Crear el archivo .env en la raíz del proyecto con este contenido:

   CLAVE_JWT=clave_secreta_speakme_rehab_2026
   CADUCIDAD_JWT_LOGOPEDA=12h
   CADUCIDAD_JWT_PACIENTE=30d
   CLAVE_MAESTRA_AES=tfg_rehab_2026_clave_maestra
   ITERACIONES_PASSWORD=120000
   BYTES_SALT_PASSWORD=16
   LONGITUD_HASH_PASSWORD=32
   HTTPS_ACTIVO=true
   RUTA_CLAVE_HTTPS=certs/localhost+2-key.pem
   RUTA_CERTIFICADO_HTTPS=certs/localhost+2.pem

4. Instalar las dependencias:
   npm install

5. Arrancar el servidor:
   npm start
   o
   node backend/server.js

6. Acceder a las aplicaciones desde Google Chrome:
   - App del logopeda: https://localhost:3000/logopeda/index.html
   - App del paciente: https://localhost:3000/paciente/index.html

NOTAS:
- Usar Google Chrome, ya que la API de reconocimiento de voz
  no funciona en todos los navegadores.
- Los certificados HTTPS están en la carpeta certs/.
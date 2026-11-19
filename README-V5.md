# MUSICTOOL V5 — paquete de desarrollo

## Cambios incluidos

### Estudio multipista
- Cuenta de entrada configurable de uno o dos compases de 4/4 (por defecto: dos).
- Reproducción de las pistas existentes mientras se captura una pista nueva.
- La señal de reproducción no se conecta digitalmente al canal de entrada grabado.
- Se elimina el recorte adicional por `outputLatency`, que podía desplazar/cortar el inicio de la toma.
- Control independiente de volumen y paneo por pista.
- Ecualización básica de graves/agudos y puerta de ruido ajustable por pista.
- Los ajustes se aplican a la reproducción y a la exportación WAV.

### Partituras
- Nueva sección para seleccionar y visualizar PDF localmente.
- Alternancia entre vista de partitura y editor de tablatura.
- El documento se muestra en el dispositivo y no se envía a ningún servidor.

## Limitaciones conocidas / siguientes pasos
- La selección Auriculares/Altavoz es una preferencia/aviso de monitorización; el navegador y el sistema operativo controlan la ruta física de salida. iOS Safari no permite forzar de forma fiable el dispositivo de salida desde una web.
- Para evitar que la primera guitarra o el metrónomo entren acústicamente en la segunda toma, usar auriculares. Con altavoz, el micrófono puede captar el sonido del altavoz.
- El procesador sigue usando `ScriptProcessorNode`; conviene migrarlo a `AudioWorklet` en una fase posterior y probar especialmente Safari/iOS.
- La pestaña de tablatura es un editor manual. La conversión automática IA/OMR de partitura a tablatura no está integrada: requiere un motor de reconocimiento musical y validación de notas, cuerdas y posiciones.
- La previsualización PDF depende del visor PDF del navegador. En algunos dispositivos iOS puede abrirse en el visor del sistema en lugar de incrustarse.
- Probar grabación real, sincronía, permisos, auriculares Bluetooth/cableados y exportación en iPhone y Android antes de publicar como versión estable.

## Publicación
Subir el contenido completo de esta carpeta al repositorio GitHub Pages, reemplazando los archivos de la versión anterior después de conservar una copia de seguridad. El Service Worker usa la caché `musictool-v5` para forzar la actualización de los recursos.

# Logo de The Taber Square + niveles libres en Eternity II

## 1. Nuevo logo de The Taber Square

- Subir la imagen del cavernícola con la torre de piedra y el rótulo "THE TABER SQUARE" al CDN de assets y crear su puntero en `src/assets/`.
- Sustituir el logo actual de la página `/the-taber-square` por el nuevo (mismo sitio, junto al título).
- Usarlo también en la tarjeta del juego en la home, para que ambas vistas sean coherentes.
- Eliminar del CDN el puntero del logo antiguo si deja de usarse.

## 2. Eternity II: todos los niveles disponibles

- Quitar el bloqueo por progresión: los cinco tamaños (4x4, 6x6, 8x8, 12x12, 16x16) serán seleccionables desde el principio.
- Se elimina el candado y el estado deshabilitado de los botones de nivel.
- El resto del juego (validación, pieza pista del 16x16, ayuda de candidatas) no cambia.

## Detalles técnicos

- `src/assets/taber-square-logo.png.asset.json` regenerado con `lovable-assets create`.
- `src/routes/the-taber-square.tsx`: mismo `img`, nueva URL de asset.
- `src/routes/index.tsx`: la tarjeta de The Taber Square muestra el nuevo logo.
- `src/routes/eternity-ii.tsx`: se retira el estado `unlocked`, la clave `taber-e2-unlocked` de localStorage y la condición `locked` del selector de niveles.

# The Taber Games

The Taber Games es una colección de puzles y juegos de lógica creados para ofrecer experiencias de resolución mental, creatividad espacial y deducción. La propuesta combina mecánicas abstractas inspiradas en enigmas clásicos con una interfaz moderna, partidas con ranking y una experiencia multidioma.

La plataforma reúne varios juegos con estilos muy distintos, pero todos comparten la misma filosofía: ofrecer desafíos elegantes, resolubles y adictivos, donde la intuición, la observación y la planificación son esenciales.

## ¿Qué incluye el proyecto?

Este repositorio contiene una pequeña biblioteca de juegos de pensamiento, cada uno con su propia identidad:

- The Taber Square: un puzle de encaje geométrico basado en cuadrículas y poliominós.
- The Taber's Star: un desafío de colocación en un tablero con forma de estrella, con piezas triangulares y bloqueadores.
- Taber's Eternity: un problema de conexión de bordes y patrones, con niveles progresivos y un reto extremo en su versión original de 16×16.
- Murdoku: un juego de misterio y deducción con sospechosos, armas y lugares, además de creación y revisión de casos.

## Juegos disponibles

### The Taber Square

Un puzle de colocación donde hay que poner nueve piezas en un tablero 6×6 tras lanzar siete bloqueadores. Las piezas pueden rotarse y voltearse, y cada nivel añade nuevas restricciones para hacer el desafío más exigente.

Es un juego de precisión espacial: cada decisión afecta a la disposición del resto del tablero, y la clave está en encontrar combinaciones que encajen sin dejar huecos.

### The Taber's Star

Aquí el reto consiste en rellenar una estrella con once piezas triangulares. Tras colocar los bloqueadores, hay que encontrar cómo ubicarlas para completar la forma sin superponer ni dejar espacios vacíos.

Es un puzle más visual y táctil, con una geometría muy distinta a la del cuadrado pero con la misma sensación de resolución elegante.

### Taber's Eternity

Este juego se centra en la coincidencia de bordes y patrones entre piezas vecinas. Comienza en tableros pequeños y va aumentando la complejidad hasta llegar al famoso desafío original de 256 piezas, donde nadie ha resuelto todavía el tablero completo.

Es un proyecto especialmente interesante para los amantes de los puzles de lógica y la resolución por observación, conexión y eliminación progresiva de opciones.

### Taber's Murdoku: 

Taber's Murdoku mezcla el estilo de un misterio con la lógica deductiva. El jugador debe deducir el sospechoso, el arma y el lugar a partir de pistas, marcando hechos y eliminaciones en un cuaderno de deducción.

Además, la aplicación permite crear y compartir casos, así como revisarlos antes de publicarlos, lo que añade una capa de creación comunitaria al juego.

## Stack tecnológico

El proyecto está desarrollado con tecnologías modernas para una experiencia web rápida y mantenible:

- React
- TypeScript
- Vite
- TanStack Start / TanStack Router
- Tailwind CSS
- Supabase para servicios y almacenamiento relacionados

## Desarrollo local

Requisitos:

- Node.js
- npm

```bash
git clone <url-del-repositorio>
cd taber-games
npm install
npm run dev
```

La aplicación estará disponible en el puerto por defecto de Vite para poder probar los juegos en local.

## Scripts útiles

```bash
npm run dev      # inicia el entorno de desarrollo
npm run build    # compila la aplicación para producción
npm run preview  # sirve la versión de producción localmente
npm run test     # ejecuta la suite de pruebas
npm run lint     # comprueba el código con ESLint
```

## Objetivo del proyecto

The Taber Games busca crear un catálogo de juegos de lógica con un fuerte componente visual, una gran variedad de mecánicas y una experiencia pensada para jugadores que disfrutan resolviendo enigmas, patrones y rompecabezas con una capa narrativa o estética propia.

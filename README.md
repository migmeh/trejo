Simple Aplicación web que permita a los usuarios, gestionar tareas mediante un tablero estilo Trello con funcionalidad de arrastrar y soltar

Para esta prueba tecnica se utulizo la API API de ReqRes (https://reqres.in) para la autenticación y obtención de datos simulados.

```
{
    "email": "eve.holt@reqres.in",
    "password": "pistol"
}
```
# Arquitectura General

La aplicación se estructurará en las siguientes capas principales:

### 1.- Frontend (Next.js):

Componentes de presentación (React con Styled Components).
Gestión del estado global (Redux Toolkit).
Lógica de autenticación y llamadas a la API (ReqRes).
Implementación del tablero Kanban con funcionalidad drag and drop.
Manejo de eventos en tiempo real (WebSockets o SSE).
Pruebas unitarias y de integración (React Testing Library y Jest).

### 2.- Backend (Simulado con ReqRes):

Se utilizará la API de ReqRes para simular la autenticación de usuarios y la obtención de datos iniciales de las tareas. Aunque ReqRes no ofrece persistencia real ni WebSockets, simularemos su comportamiento en el frontend para cumplir con los requisitos.

### 3.- Estado Global (Redux):

Se diseñarán slices de Redux para gestionar el estado de autenticación, el estado del tablero (listas y tareas), y cualquier otro estado global relevante. Se utilizarán estructuras de datos complejas dentro del estado para evitar arreglos simples.

## Tablero Estilo Trello con Drag and Drop:

Se utilizo una biblioteca de drag and drop (como react-beautiful-dnd o react-dnd) para implementar la funcionalidad de arrastrar y soltar entre columnas (listas) y dentro de las columnas (orden de las tareas).

El estado del tablero en Redux se representará mediante una estructura de datos compleja.

#### Estructura de Datos:

Dado que estamos utilizando ReqRes (que no ofrece persistencia real), la persistencia se simulará en el frontend.

Al cargar la aplicación, se podrían hacer llamadas a endpoints simulados de ReqRes para obtener los datos iniciales del tablero.

Las modificaciones realizadas por el usuario (creación, edición, arrastrar y soltar tareas) se actualizarán en el estado de Redux y, para simular la persistencia, se podrían guardar en localStorage o sessionStorage.

#### Es crucial entender que esto es una simulación y no una persistencia real en una base de datos.

Redux Toolkit para simplificar la configuración de Redux y la escritura de código boilerplate.

Se creo slices para cada parte del estado global (autenticación, tablero).

Se utilizo createAsyncThunk para manejar las llamadas asíncronas a la API de ReqRes.

Se utilizo selectors para acceder a partes específicas del estado de forma eficiente.

### Estructuras de Datos Compleja

Se evito arreglos simples para el almacenamiento y manejo del estado. Se utilizo objetos con claves para un acceso más eficiente y para representar las relaciones entre las listas y las tareas.

### Uso de WebSockets o Server-Sent Events (SSE)

Dado que ReqRes no proporciona soporte para WebSockets o SSE, esta funcionalidad se simulo en el frontend.


### Cifrado de Información Sensible:

En un escenario real, la información sensible (como contraseñas) nunca se enviaría ni se almacenaría sin cifrar en el frontend.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

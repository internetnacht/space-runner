# Internetnacht Game 2023

> Jump 'n' run Phaser 3 game with modern frontend tooling using Vite.

## Prerequisites

You'll need [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed.

It is highly recommended to use [Node Version Manager](https://github.com/nvm-sh/nvm) (nvm) to install Node.js and npm.
The game was developed with Node v16.16.0 and npm v9.3.0.
(For Windows users there is [Node Version Manager for Windows](https://github.com/coreybutler/nvm-windows).)

Install Node.js and `npm` with `nvm`:

```bash
nvm install node

nvm use node
```

Replace 'node' with 'latest' for `nvm-windows`.

## Getting Started

```bash
cd game2024

npm install
```

Start development server:

```
npm run dev
```

To create a production build:

```
npm run build
```

Production files will be placed in the `dist` folder. Then upload those files to a web server. 🎉

## Project Structure

```
    .
    ├── dist
    ├── node_modules
    ├── assets
    ├── src
    │   ├── main.ts
    │   ├── ...
	├── index.html
    ├── package.json
```

TypeScript-files are intended for the `src` folder. `main.ts` is the entry point referenced by `index.html`.

## Static Assets

Any static assets like images, maps or audio files should be placed in the `assets` folder.
It'll then be served from the root. For example: http://localhost:8082/images/my-image.png

Example `public` structure:

```
    public
    ├── images
    │   ├── my-image.png
    ├── music
    │   ├── ...
    ├── sfx
    │   ├── ...
```

They can then be loaded by Phaser with `this.image.load('my-image', 'images/my-image.png')`.

## Dev Server Port

You can change the dev server's port number by modifying the `vite.config.js` file. Look for the `server` section:

```js
{
	// ...
	server: { host: '0.0.0.0', port: 8082 }
}
```

Change 8082 to whatever you want.

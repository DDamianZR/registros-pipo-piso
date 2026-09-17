// Quita los metadatos "funding" de terceros del lockfile de npm.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rutaLock = resolve(process.cwd(), 'package-lock.json');
const verificar = process.argv.includes('--verificar');

const contenido = readFileSync(rutaLock, 'utf8');
const lock = JSON.parse(contenido);
const paquetes = lock.packages ?? {};

const rutasConFunding = Object.keys(paquetes).filter(
  (ruta) => paquetes[ruta] && Object.prototype.hasOwnProperty.call(paquetes[ruta], 'funding'),
);

if (verificar) {
  if (rutasConFunding.length > 0) {
    for (const ruta of rutasConFunding) {
      console.log(ruta);
    }
    process.exit(1);
  }
  console.log('Lockfile verificado: sin campos funding.');
  process.exit(0);
}

for (const ruta of rutasConFunding) {
  delete paquetes[ruta].funding;
}

writeFileSync(rutaLock, JSON.stringify(lock, null, 2) + '\n');
console.log(`Lockfile limpio: se quitaron ${rutasConFunding.length} campos funding.`);

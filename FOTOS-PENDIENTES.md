# Fotos pendientes — Avril

Todas las fotos de la web son **provisionales**. Vienen de [Unsplash](https://unsplash.com) (licencia Unsplash: uso libre, también comercial, sin atribución obligatoria) y se descargaron en formato WebP dentro de `assets/img/`.

Cuando tengas fotos propias, **reemplaza el archivo manteniendo el mismo nombre** (ej. `alfajores.webp`) y la web se actualiza sola. Tamaños recomendados: 1000×1280 px para el hero, 800×800 px para tarjetas. En el código cada foto está marcada con `<!-- FOTO PROVISIONAL: reemplazar por foto real de Avril -->`.

> Ojo: las chocotejas no existen en bancos de fotos, así que se usaron bombones parecidos. Es la primera foto que conviene reemplazar.

| Archivo | Dónde se usa | Fuente provisional (Unsplash) |
|---|---|---|
| `hero-caja-regalo.webp` | Inicio · hero (arco) | https://images.unsplash.com/photo-1566565286951-f81c7ba5619d |
| `og-image.jpg` | Imagen para compartir en redes (1200×630) | https://images.unsplash.com/photo-1566565286951-f81c7ba5619d |
| `trufas-rosadas.webp` | Semáforo (versión Avril), Inspírate | https://images.unsplash.com/photo-1640237915819-85b39c1f7851 |
| `trufas-bitter.webp` | Reserva (catálogo) | https://images.unsplash.com/photo-1775201630951-665651af1747 |
| `alfajores.webp` | Reserva (catálogo) | https://images.unsplash.com/photo-1586195831749-9fc3b289b4e4 |
| `chocotejas.webp` | Reserva (catálogo) | https://images.unsplash.com/photo-1682120501920-7ce18b00237a |
| `brownies.webp` | Inspírate · “Sorpresa de cumple” | https://images.unsplash.com/photo-1636743715220-d8f8dd900b87 |
| `torta-alfajor.webp` | Inicio · “Torta de alfajor” | https://images.unsplash.com/photo-1665355986953-1478c50c2a7d |
| `caja-corporativa.webp` | Inicio, Empresas, Inspírate | https://images.unsplash.com/photo-1548741487-18d363dc4469 |
| `mesa-postres.webp` | Inicio · “Mesa de postres” | https://images.unsplash.com/photo-1769812343484-df7391e843d6 |
| `proceso-banado.webp` | Mi Avril · paso 2 del seguimiento | https://images.unsplash.com/photo-1571586616199-4b93617e0175 |
| `proceso-decorado.webp` | Mi Avril · paso 3 del seguimiento | https://images.unsplash.com/photo-1560863223-8b2edc408435 |
| `caja-cofre.webp` | Semáforo rojo (alternativa) | https://images.unsplash.com/photo-1481391319762-47dff72954d9 |
| `antes-1.webp` / `despues-1.webp` | Banda “Tu referencia vs. tu caja Avril” | photo-1670843628786-54cd971f657d / photo-1757450317518-9d385619f5ee |
| `antes-2.webp` / `despues-2.webp` | Banda “Tu referencia vs. tu caja Avril” | photo-1665355987264-46d2adbbd2d1 / photo-1665355986889-5ab216467985 |
| `antes-3.webp` / `despues-3.webp` | Banda “Tu referencia vs. tu caja Avril” | photo-1785960160436-242768ecc23a / photo-1526081715791-7c538f86060e |
| `repostera.webp` | Inicio · “Por qué Avril” | https://images.unsplash.com/photo-1620039423059-58fe9a0ca20a |
| `caja-amiga.webp` | Cajas listas · “Cumple de mejor amiga” | https://images.unsplash.com/photo-1734692928513-351516b38869 |
| `caja-perdon.webp` | Cajas listas · “Perdón” | https://images.unsplash.com/photo-1624708331492-71ccacb5c8e7 |
| `caja-chamba.webp` | Cajas listas · “Chamba nueva” | https://images.unsplash.com/photo-1573013792262-761a3e17fb39 |
| `caja-aniversario.webp` | Cajas listas · “Aniversario” | https://images.unsplash.com/photo-1687795097254-f019f9d7fd17 |
| `testimonio-1.webp` … `testimonio-3.webp` | Testimonios de ejemplo, “Amigas desde siempre” | photo-1787788629722-02cf905bb188 · photo-1611755294724-1350aa86c569 · photo-1763700667398-24ae7f2289fc |

## Prompts para generar fotos con IA (opcional)

Si prefieres generar fotos con IA en vez de usar las de banco, al final de cada prompt agrega:
`soft natural window light, warm cream and blush pink background, editorial food photography, shallow depth of field, high detail, no text, no logos, no watermark`

- **hero-caja-regalo**: Top-down view of an open cream gift box with 9 assorted handmade sweets: pink-coated chocolate truffles, Peruvian alfajores dusted with powdered sugar, wrapped chocolate bonbons, small brownie squares, pink satin ribbon, on blush pink linen
- **chocotejas**: Peruvian chocotejas: rectangular handmade chocolate bonbons filled with dulce de leche and pecans, some wrapped in pastel tissue paper with twisted ends, on a cream surface
- **alfajores**: Peruvian alfajores, soft round shortbread cookies filled with dulce de leche, dusted with powdered sugar, stacked, one cut in half showing the caramel filling
- **torta-alfajor**: Peruvian alfajor layer cake, thin cookie layers with dulce de leche, top dusted with powdered sugar and decorated with a small edible printed photo disc, on a cake stand
- **caja-corporativa**: Many small identical kraft-and-cream gift boxes with 2 chocolate truffles each, a blank round sticker on each lid for a company logo, arranged in a grid on a table
- El resto de prompts está en el brief original (sección 8).

## Otros datos pendientes

- Precios reales → `lib/manifest.js` (objeto `PRECIOS`).
- `[URL INSTAGRAM]`, `[URL TIKTOK]` → enlaces del footer en cada página.
- `[DIRECCIÓN / RECOJO EN TIENDA]`, `[DISTRITOS CON DELIVERY]`, `[TIEMPOS DE ANTICIPACIÓN]` → `disena.html` e `inspirate.html` (preguntas frecuentes).
- Testimonios reales → `index.html` (marcados `[TESTIMONIO DE EJEMPLO]`).
- Logos de clientes → `empresas.html` (`[Logo cliente]`).

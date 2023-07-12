import express from 'express';
import cartRouter from './Routes/cart.js';
import productRouter from './Routes/product.js';

const app = express();

// PARA RECIBIR DATOS COMPLEJOS DESDE LA URL Y TRABAJAR CON JSON
app.use( express.urlencoded( { extended: true } ) )
app.use( express.json() )

// incorporo en app mi router
app.use( '/api/products', productRouter )
app.use( '/api/carts', cartRouter )

const PORT = 8080;
const server = app.listen( PORT, () => console.log( `Server running on port: ${server.address().port}` ) )
server.on( 'error', error => console.log( error ) )
import ProductManager from './ProductManager/ProductManager.js';
import express from 'express';

const app = express();

// PARA RECIBIR DATOS COMPLEJOS DESDE LA URL
app.use( express.urlencoded( { extended: true } ) )

const manager = new ProductManager()

app.get( '/products', async ( req, res ) => {
  let { limit } = req.query
  const contain = await manager.getProducts()
  let products = []
  if ( limit ) {
    for ( let i = 0; i < limit; i++ ) {
      const element = contain[i];
      if ( !element ) break
      products.push( element )

    }
  } else {
    products = contain
  }

  res.send( { products } )
} )

app.get( '/products/:pid', async ( req, res ) => {
  let id = req.params.pid
  let response = await manager.getProductById( id )
  let product = response?.id ? response : 'Error: product not found'

  res.send( { product } )
} )

app.listen( 8080, () => {
  console.log( 'Server running on port: 8080' )
} )
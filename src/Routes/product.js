import { Router } from 'express';
import ProductManager from '../ProductManager/ProductManager.js';

const productRouter = Router()

const productManager = new ProductManager()


// GET PRODUCTS
// DEVUELVE UNA LISTA DE TODOS LOS PRODUCTOS GUARDADOS EN EL ARCHIVO products.json
// ACEPTA QUERY LIMIT PARA DEFINIR LA CANTIDAD A DEVOLVER
productRouter.get( '/', async ( req, res ) => {
  let { limit } = req.query
  const contain = await productManager.getProducts()
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


// GET PRODUCT BY ID
// MUESTRA EL PRODUCTO QUE TIENE EL ID PASADO POR PARAMETRO
productRouter.get( '/:pid', async ( req, res ) => {
  let id = req.params.pid
  let response = await productManager.getProductById( id )
  // doble validacion???
  let product = response?.id ? response : res.status( 404 ).send( { status: "error", msg: "Product not found" } )

  res.send( { product } )
} )

// PUT PRODUCT BY ID
// RECIBE POR BODY UN PRODUCTO Y POR PARAMETRO UN ID, SI PASA LAS VALIDACIONES QUE TIENE EL METODO updateProduct
// REESCRIBE EL ARCHIVO products.json CON EL PRODUCTO MODIFICADO
productRouter.put( '/:pid', async ( req, res ) => {
  let id = req.params.pid
  let product = req.body
  let response = await productManager.updateProduct( id, product )
  if ( !response ) {
    res.status( 404 ).send( { status: 'Error', msg: 'Error trying to update product' } )
  } else {
    res.send( { status: 'Success', msg: `Product with id ${id} modified` } )
  }
} )

// POST PRODUCT
// RECIBE POR BODY UN PRODUCTO Y LO AGREGA EN EL ARCHIVO product.json
productRouter.post( '/', async ( req, res ) => {
  let product = req.body
  let response = await productManager.addProduct( product )
  if ( !response ) {
    res.status( 400 ).send( { status: 'Error', msg: 'Error trying to add product' } )
  }
  res.send( { status: 'Success', msg: `Product added` } )
} )


// DELETE PRODUCT
// RECIBE UN ID POR PARAMETRO Y BORRA DEL ARCHIVO EL PRODUCTO CON ESE ID
productRouter.delete( '/:pid', async ( req, res ) => {
  let id = req.params.pid
  let response = await productManager.deleteProduct( id )
  if ( !response ) {
    res.status( 400 ).send( { status: 'Error', msg: 'Error trying to delete product' } )
  } else {
    res.send( { status: 'Success', msg: `Product with id ${id} deleted.` } )
  }
} )
export default productRouter; 
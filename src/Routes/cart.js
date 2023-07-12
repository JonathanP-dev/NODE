import { Router } from 'express';
import CartManager from '../CartManager/CartManager.js';

const cartRouter = Router()

const cartManager = new CartManager();

// LA CONSIGNA NO PIDE UN GET GENERAL, PERO PARA PODER USAR MAS DE UN CARRITO E IR COMPROBANDO QUE TODO FUNCIONE LA HICE
// EN CASO DE QUE CONSIDEREN QUE NO ES NECESARIA LA BORRO Y NO HAY DIFERENCIA

// METODO GET 
// LISTA TODOS LOS CARRITOS GUARDADOS EN EL ARCHIVO
// ACEPTA EL QUERY LIMIT, EN CASO DE RECIBIRLO RECORRE EL ARREGLO OBTENIDO Y SOLO LISTA LA CANTIDAD SOLICITADA
cartRouter.get( '/', async ( req, res ) => {
  let { limit } = req.query
  const contain = await cartManager.getCarts()
  let carts = []
  if ( limit ) {
    for ( let i = 0; i < limit; i++ ) {
      const element = contain[i];
      if ( !element ) break
      carts.push( element )
    }
  } else {
    carts = contain
  }

  res.send( { carts } )
} )


// GET CART POR ID
// MUESTRA EL ARREGLO DE PRODUCTOS DEL CARRITO QUE TIENE EL ID INGRESADO POR PARAMETRO
cartRouter.get( '/:cid', async ( req, res ) => {
  let id = req.params.cid
  let response = await cartManager.getCartById( id )
  response?.id ? res.send( response.products ) : res.status( 404 ).send( { status: "error", msg: "Cart not found" } )

  // res.send( { cart } )
} )


// POST CART
// PARA CREAR UN CARRITO SE SOLICITA QUE SE INGRESE UN ARREGLO CON AL MENOS UN PRODUCTO (PUEDEN SER MAS)
// ME PARECE MAS ACERTADO CREAR UN CARRITO CUANDO YA SE TIENE AL MENOS UN PRODUCTO, PERO PODRIA HACER
// LO MISMO SIN BODY Y EN EL CONSTRUCTOR AGREGAR UN ARRREGLO VACIO PARA PRODUCTS.
cartRouter.post( '/', async ( req, res ) => {
  const cart = req.body
  let response = await cartManager.addCart( cart )
  console.log( response )
  if ( !response ) {
    res.status( 400 ).send( { status: 'Error', msg: 'Error trying to add cart' } )
  }
  res.send( { status: 'Success', msg: `Cart added` } )
} )

// POST PRODUCT TO CART
// INGRESANDO UN CID Y UN PID VALIDOS SE PUEDE AGREGAR EL PRODUCTO DE PID AL ARREGLO DE PRODUCTOS DE ESE CARRITO
// VALIDACIONES EN CartManager.js
cartRouter.post( '/:cid/product/:pid', async ( req, res ) => {
  let cid = req.params.cid;
  let pid = req.params.pid;
  let response = await cartManager.addProductToCart( cid, pid )
  console.log( response )
  if ( !response ) {
    res.status( 400 ).send( { status: 'Error', msg: 'Error trying to add cart' } )
  }
  res.send( { status: 'Success', msg: `Cart added` } )
} )

export default cartRouter;
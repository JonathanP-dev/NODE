import fs from 'fs'
import ProductManager from '../ProductManager/ProductManager.js';

// para trabajar con el carrito voy a tener que poder leer los productos asi que instancio un ProductManager
const productManager = new ProductManager();

export default class CartManager {
  #carts;
  #id;
  #path;
  constructor() {
    this.#carts = []
    this.#id = 0
    this.#path = './carts.json'
  }

  // Para crear el ID lo hago con un Date.now(), ademas le concateno el length porque no estoy 100% seguro de que el Date.now() no se pueda repetir si se hace muy rapido.
  // De esa forma me aseguro que no se va a repetir.
  async #setId () {
    try {
      const contain = await fs.promises.readFile( this.#path )
      const carts = JSON.parse( contain )
      this.#id = `${Date.now()}-${carts.length}`
    } catch ( error ) {
      if ( error.code == 'ENOENT' ) {
        this.#id = `${Date.now()}-1`
      } else {
        console.log( `Error code: ${error}` )
      }
    }
    return this.#id
  }


  // Para los dos metodos get uso basicamente la misma logica que en el ProductManager
  // Trato de leer el archivo, si no existe retorno un array vacio, si exite retorno lo que necesito.
  async getCarts () {
    try {
      const contain = await fs.promises.readFile( this.#path )
      const carts = JSON.parse( contain )
      return carts
    } catch ( error ) {
      if ( error.code == 'ENOENT' ) {
        return this.#carts;
      } else {
        console.log( `Error code: ${error}` )
      }
    }
  }

  async getCartById ( id ) {
    try {
      const contain = await fs.promises.readFile( this.#path )
      const carts = JSON.parse( contain )
      const found = carts.find( cart => cart.id == id )
      if ( !found ) {
        console.log( `Cart with ID: ${id} not found` )
        return false
      }
      return found
    } catch ( error ) {
      if ( error.code == 'ENOENT' ) {
        return this.#carts;
      } else {
        console.log( `Error code: ${error}` )
        return false
      }
    }
  }


  async addCart ( products ) {

    let newCart = {
      id: await this.#setId(),
      products: products
    }

    // antes de leer archivo chequeamos que efectivamente se haya ingresado algo en el post.
    // de esta forma ahorramos todos los pasos posteriores.
    if ( !products ) {
      console.log( `Invalid value` )
      return false
    }

    // Compruebo que se ingresaron al menos los dos valores que se necesita para agregar productos al carrito
    // Comprobar mas adelante que no se puedan ingresar valoras extra. (tal vez comprobando que el length tiene que ser 2????)
    const IdQuantityCheck = products?.find( product => {
      return ( product?.quantity > 0 && product?.id?.length > 0 )
    } )

    if ( !IdQuantityCheck ) {
      console.log( `Quantity or ID error` )
      return false
    }


    try {
      // leemos si el archivo tiene algo, en caso de que tenga algo se lo asignamos a carritos
      const contain = await fs.promises.readFile( this.#path )
      // chequear el caso de que el archivo exista pero este vacio.
      const carts = JSON.parse( contain )
      if ( carts ) {
        this.#carts = carts
      }

      // recorro el arrary de productos que recibo por parametros y voy comprobando que en todos
      // se cumpla la condicion de que exista el id en el archivo de productos.
      // chequear forma de hacerlo con every/some u otro metodo de array.
      let isValid = true
      for ( let i = 0; i < products.length; i++ ) {
        let productInProducts = products[i];
        productInProducts = await productManager.getProductById( productInProducts.id )
        if ( !productInProducts ) {
          console.log( 'Error: producto no encontrado', productInProducts )
          isValid = false
        }
      }

      if ( isValid ) {
        // si llegamos aca, esta validado asi que lo pusheamos y escribimos el archivo
        this.#carts.push( newCart )
        await fs.promises.writeFile( this.#path, JSON.stringify( this.#carts ) )
        console.log( `Cart '${newCart.id}' added.-` )
        return true

      } else {
        console.log( 'isValid: ', isValid )
        return false
      }

    } catch ( error ) {
      if ( error.code == 'ENOENT' ) {

        // si el codigo de error es ENOENT es porque el archivo no existe, si no existe, no tenemos datos.
        // si no tenemos datos lo creamos con un arreglo vacio y llamamos recursivamente a la funcion addCart.
        console.log( `ARCHIVO VACIO:` )
        await fs.promises.writeFile( this.#path, JSON.stringify( [] ) )
        await this.addCart( products )
        return true
      } else {
        console.log( `Error code: ${error}` )
        return false
      }
    }
  }


  // Comprobar mejora a este metodo, pedir consejos???
  async addProductToCart ( cid, pid ) {

    // seteo todo lo que entra en juego para las validaciones
    const carts = await this.getCarts()
    let newCarts = carts
    const cart = await this.getCartById( cid );
    let newCart = cart
    const product = await productManager.getProductById( pid );

    // en esta variable guardo el arreglo de productos que tiene el carrito del id que ingrese por parametro
    const productsInCart = cart.products;


    // si alguna de las variables anteriores da error ya salgo antes de hacer nada y retorno false
    if ( !cart ) {
      console.log( `Cart id ${cid} not found` )
      return false
    }

    if ( !product ) {
      console.log( `Product id ${pid} not found` )
      return false
    }

    // con esta variable compruebo si en el arreglo de productos del carrito que obtube con el cid ingresado ya existe o no el 
    // producto que obtube con el id ingresado por parametro
    const quantityCheck = cart.products.find( item => item.id == pid )

    this.#carts = newCarts

    // si no existe el producto entonces puedo agregar un objeto al array de productos de ese carrito y reescribir el archivo
    if ( !quantityCheck ) {
      carts.map( ( item, index ) => {
        if ( item.id == cid ) {
          newCarts.splice( index, 1, { id: cid, products: [...item.products, { id: pid, quantity: 1 }] } )
        }
        return newCarts
      } )
      this.#carts = newCarts
      console.log( `Product with id: ${product.title} (${pid}) added to cart ${cid}` )
      fs.promises.writeFile( this.#path, JSON.stringify( this.#carts ) )
      console.log( 'newCart', newCart.products )
      console.log( 'newCarts', newCarts )
      return true

    } else {
      // si ya existe en el array tengo que sumarle uno a la cantidad anterior.
      // para eso lo que hago es recorrer el arreglo de productos del carrito y donde coincide, reemplazo en la
      // variable seteada anteriormente la cantidad en ese indice en particular.
      cart.products.map( ( item, index ) => {
        if ( item.id == pid ) {
          productsInCart.splice( index, 1, { ...item, quantity: item.quantity + 1 } )
        }
        return productsInCart
      } )

      // una vez modificado el arreglo de productos lo que hago es guardar en una variable el carrito completo con 
      // el cid ingresado por parametro y el arreglo de productos nuevo
      newCart = { id: cid, products: productsInCart }

      // recorro el viejo arreglo de carritos y en donde coincide el cid cambio el carrito viejo por el nuevo
      // de esta manera tengo un nuevo arreglo de carritos con el carrito modificado.
      carts.map( ( item, index ) => {
        if ( item.id == cid ) {
          newCarts.splice( index, 1, newCart )
        }
        return newCarts
      } )

      // Por ultimo reescribo el archivo cambiando el arreglo anterior por el nuevo arreglo
      this.#carts = newCarts
      fs.promises.writeFile( this.#path, JSON.stringify( this.#carts ) )
      console.log( 'el producto ya existe en el carrito de agrego una unidad mas' )
      return true
    }
  }
}
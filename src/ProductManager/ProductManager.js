import fs from 'fs'

export default class ProductManager {
  #products;
  #id;
  #path;
  constructor() {
    this.#products = []
    this.#id = 0;
    this.#path = './products.json'
  }

  async #setId () {
    try {
      const contain = await fs.promises.readFile( this.#path )
      const products = JSON.parse( contain )
      let lastID = products.pop()
      this.#id = lastID.id + 1
    } catch ( error ) {
      if ( error.code == 'ENOENT' ) {
        this.#id = 1
      } else {
        console.log( `Error code: ${error}` )
      }
    }
    return this.#id
  }

  async addProduct ( product ) {
    let newProduct = {
      id: await this.#setId(),
      code: product.code,
      title: product.title,
      description: product.desc,
      price: product.price,
      status: true,
      category: product.category,
      thumbnail: product.thumb || ['Sin imagen'],
      stock: product.stock
    }

    if ( !product.title || !product.code || !product.desc || !product.price || !product.category || !product.stock ) {
      console.log( `Invalid value.` )
      return false;
    }

    try {
      const contain = await fs.promises.readFile( this.#path )
      const products = JSON.parse( contain )
      if ( products ) {
        this.#products = products
      }

      const found = products.find( product => product.code == newProduct.code )
      if ( found ) {
        console.log( `ERROR. Code ${newProduct.code} for product '${newProduct.title}' is already used in product '${product.title}'.` )
        return false
      } else {
        this.#products.push( newProduct )
        await fs.promises.writeFile( this.#path, JSON.stringify( this.#products ) )
        console.log( `Product '${newProduct.title}' added.-` )
        return `Product '${newProduct.title}' added.-`
      }
    } catch ( error ) {
      if ( error.code == 'ENOENT' ) {
        this.#products.push( newProduct )
        await fs.promises.writeFile( this.#path, JSON.stringify( this.#products ) )
        console.log( `Product '${newProduct.title}' added.` )
        return true
      } else {
        console.log( `Error code: ${error}` )
        return false
      }
    }
  }

  async getProducts () {
    try {
      const contain = await fs.promises.readFile( this.#path )
      const products = JSON.parse( contain )
      return products
    } catch ( error ) {
      if ( error.code == 'ENOENT' ) {
        return this.#products;
      } else {
        console.log( `Error code: ${error}` )
      }
    }
  }

  async getProductById ( id ) {
    try {
      const contain = await fs.promises.readFile( this.#path )
      const products = JSON.parse( contain )
      const found = products.find( product => product.id == id )
      if ( !found ) {
        console.log( `Product with ID: ${id} not found` )
        return false
      }
      return found
    } catch ( error ) {
      if ( error.code == 'ENOENT' ) {
        return this.#products;
      } else {
        console.log( `Error code: ${error}` )
        return false
      }
    }
  }


  async updateProduct ( id, product ) {
    if ( !product.title || !product.code || !product.desc || !product.price || !product.category || !product.stock ) {
      console.log( `Invalid value.` )
      return false;
    }
    try {
      const contain = await fs.promises.readFile( this.#path )
      const products = JSON.parse( contain )
      this.#products = products

      const found = products.find( exists => exists.id == id )
      if ( !found ) {
        console.log( `Product with ID: ${id} not found` )
        return false
      }

      const titleError = products.find( item => item.code == product.code )
      if ( titleError ) {
        if ( titleError.title !== product.title ) {
          console.log( `ERROR. Code ${product.code} for product '${product.title}' is already used in product '${titleError.title}'.` )
          return false;
        }
      }

      const newProducts = this.#products
      products.map( ( item, index ) => {
        if ( item.id == id ) {
          newProducts.splice( index, 1, { id: id, ...product } )
        }
        return newProducts
      } )

      this.#products = newProducts
      fs.promises.writeFile( this.#path, JSON.stringify( this.#products ) )
      console.log( `Product with ID ${id} modified.` )
      return true
    } catch ( error ) {
      if ( error.code == 'ENOENT' ) {
        console.log( `No cuenta con productos para modificar` );
        return false
      } else {
        console.log( `Error code: ${error}` )
        return false
      }
    }
  }


  async deleteProduct ( id ) {
    try {
      const contain = await fs.promises.readFile( this.#path )
      let products = JSON.parse( contain )

      const newProducts = products.filter( product => product.id !== id )
      if ( products.length == newProducts.length ) {
        console.log( `Product with ID: ${id} not found` )
        return false;
      }

      products = newProducts;
      fs.promises.writeFile( this.#path, JSON.stringify( products ) )
      console.log( `Product with ID ${id} deleted.` )
      this.#products = products
      return true

    } catch ( error ) {
      if ( error.code == 'ENOENT' ) {
        console.log( this.#products );
        return false
      } else {
        console.log( `Error code: ${error}` )
        return false
      }
    }
  }
}

// TEST CODE
// const manager = new ProductManager()

// const productsToAdd = [
//   {
//     code: 710,
//     title: 'prod1',
//     desc: 'cocoa vascolet',
//     price: 100,
//     category: 'Comida',
//     stock: 10
//   },
//   {
//     code: 720,
//     title: 'prod2',
//     desc: 'cafe negro',
//     price: 120,
//     category: 'Comida',
//     thumb: ['Sin imagen'],
//     stock: 5
//   },
//   {
//     code: 730,
//     title: 'prod3',
//     desc: 'te ingles',
//     price: 900,
//     category: 'Bebida',
//     thumb: ['Sin imagen'],
//     stock: 15
//   },
//   {
//     code: 740,
//     title: 'prod4',
//     desc: 'te ingles',
//     price: 900,
//     category: 'Comida',
//     thumb: ['Sin imagen'],
//     stock: 15
//   },
//   {
//     code: 750,
//     title: 'prod5',
//     desc: 'te ingles',
//     price: 900,
//     category: 'Merienda',
//     thumb: ['Sin imagen'],
//     stock: 15
//   },
//   {
//     code: 760,
//     title: 'prod6',
//     desc: 'te ingles',
//     price: 900,
//     category: 'Merienda',
//     thumb: ['Sin imagen'],
//     stock: 15
//   },
//   {
//     code: 770,
//     title: 'prod7',
//     desc: 'te ingles',
//     price: 900,
//     category: 'Comida',
//     thumb: ['Sin imagen'],
//     stock: 15
//   },
//   {
//     code: 780,
//     title: 'prod8',
//     desc: 'te ingles',
//     price: 900,
//     category: 'Bebida',
//     thumb: ['Sin imagen'],
//     stock: 15
//   },
//   {
//     code: 790,
//     title: 'prod9',
//     desc: 'te ingles',
//     price: 900,
//     category: 'Comida',
//     thumb: ['Sin imagen'],
//     stock: 15
//   },
//   {
//     code: 800,
//     title: 'prod10',
//     desc: 'te ingles',
//     price: 900,
//     category: 'Bebida',
//     thumb: ['Sin imagen'],
//     stock: 15
//   },
//   {
//     code: 810,
//     title: 'prod11',
//     desc: 'te ingles',
//     price: 900,
//     category: 'Bebida',
//     thumb: ['Sin imagen'],
//     stock: 15
//   }
// ]

// agregando productos
// for ( let i = 0; i < productsToAdd.length; i++ ) {
//   const product = productsToAdd[i];
//   await manager.addProduct( product )
// }

// *** UPDATE PRODUCT ***
// const product4 = {
//   code: 1144,
//   title: 'prod4',
//   desc: 'te ingles',
//   price: 900,
//   category: 'Bebida',
//   stock: 15
// }

// const product8 = {
//   code: 7448,
//   title: 'prod9',
//   desc: 'te ingles',
//   price: 900,
//   category: 'Bebida',
//   stock: 15
// }

// const product6 = {
//   code: 7440,
//   title: 'prod6',
//   desc: 'otro cafe',
//   price: 900,
//   category: 'Comida',
//   stock: 15
// }

// await manager.updateProduct( 4, product4 )
// await manager.updateProduct( 8, product8 )
// await manager.updateProduct( 6, product6 )

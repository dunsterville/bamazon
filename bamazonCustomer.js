/************
*  Globals
************/
const mysql = require('mysql2')
const inquirer = require('inquirer')

// Setup Mysql
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Beatty!8',
    database: 'bamazon'
});

let products = []

/************
*  Functions
************/

const startApp = () => {
  db.query(`SELECT * FROM products`, (err, data) => {
    if (err) {
      console.log(err)
    }
    products = data
    products.forEach(product => {
      console.log(`ID: ${product.id} | Product: ${product.product_name} | Price: ${product.price}`)
    })
    buyProduct()

  })

  const buyProduct = () => {
    inquirer.prompt({
        type: 'number',
        name: 'product',
        message: 'What product would you like to buy?'
    })
    .then(({product}) => {
      if (product > 0 && product <= 10) {
        let id = product
        let productName = products[id - 1].product_name
        let stock = products[id - 1].stock
        let price = products[id - 1].price
        if (stock > 0) {
          inquirer.prompt({
            type: 'number',
            name: 'quantity',
            message: 'How many would you like to buy?'
          })
          .then(({quantity}) => {
            if (quantity > stock) {
              console.log(`Sorry there's only ${stock} ${productName} currently available.`)
              buyProduct()
            } else {
              stock = stock - quantity
              let cost = (quantity * price).toFixed(2)
              db.query(`UPDATE products SET stock = ${stock} WHERE id = ${id}`, err => {
                if (err) {
                  console.log(err)
                }
              })
              console.log(`You succesfully bought ${quantity} ${productName} costing $${cost}`)
              inquirer.prompt({
                type: 'confirm',
                name: 'reset',
                message: 'Would you like to buy another product?'
              })
              .then(({reset}) => {
                if (reset) {
                  startApp()
                } else {
                  process.exit()
                }
              })
              .catch(err => console.log(err))
            }
          })
          .catch(err => console.log(err))
        } else {
          console.log('Sorry that product is currently unavailable!')
          buyProduct()
        }
      } else {
        console.log('Product ID not recognised, please enter a vaild product ID')
        buyProduct()
      }
    })
    .catch(err => console.log(err))
  }
}

startApp()
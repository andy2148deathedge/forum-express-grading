const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category

const adminService = {
  // Restaurant
  getRestaurants: (req, res, cb) => {
    return Restaurant.findAll( {raw: true, nest: true, include:[Category]} )
      .then(restaurants => cb( { restaurants } ))
  },

  getRestaurant: (req, res, cb) => {
    return Restaurant.findByPk(req.params.id,  { include: [Category] })
    .then(restaurant => cb( { restaurant: restaurant.toJSON() } ))
  },

  deleteRestaurant: (req, res, cb) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => 
        restaurant.destroy()
        .then(cb( { status: 'success',  message: '' } ))
      )
  },
}

module.exports = adminService
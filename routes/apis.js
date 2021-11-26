const express = require('express')
const router = express.Router()

const adminController = require('../controllers/api/adminController')
const categoryController = require('../controllers/api/categoryController')

// restaurant
// user
// user, administrator <=> Comment

// administrator <=> restaurant
router.get('/admin/restaurants', adminController.getRestaurants)
router.get('/admin/restaurants/:id', adminController.getRestaurant)
router.delete('/admin/restaurants/:id', adminController.deleteRestaurant)
// administrator <=> Category
router.get('/admin/categories', categoryController.getCategories)
// administrator <=> User
// signup & signin

module.exports = router
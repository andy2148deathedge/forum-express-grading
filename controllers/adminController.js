// const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category

const adminService = require('../services/adminService') 

const adminController = {
  // Restaurant
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, data => 
      res.render('admin/restaurants', data )
    )
  }, // 已改

  createRestaurant: (req, res) => {
    Category.findAll({ raw:true, nest: true }).then(categories => {
      return res.render('admin/create', { categories })
    })
  },

  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, data => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }

      req.flash('success_messages', data['message'])
      return res.redirect('/admin/restaurants')
    })
  },// 已改

  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, data => 
      res.render('admin/restaurant', data)
    )
  }, // 已改

  editRestaurant: (req, res) => {
    Category.findAll({ raw: true, nest: true }).then(categories => {
      return Restaurant.findByPk(req.params.id).then(restaurant => {
        return res.render('admin/create', { 
          categories, 
          restaurant: restaurant.toJSON()
        })
      })
    })
  },

  putRestaurant: (req, res) => {
    adminService.putRestaurant(req, res, data => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }

      req.flash('success_messages', data['message'])
      return res.redirect('/admin/restaurants')
    })
  }, // 已改

  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, data => {
      if (data['status'] === 'success') 
      return res.redirect('/admin/restaurants') 
    })
  },// 已改

  // User
  getUsers: (req, res) => {
    return User.findAll( {raw: true} ).then(users => {
      return res.render('admin/users', {users}) 
    })
  },

  toggleAdmin: (req, res) => { 
    const { id } = req.params
    return User.findByPk(id).then(user => {
      if (user.email === 'root@example.com') {
        req.flash('error_messages', '禁止變更管理者權限')
        return res.redirect('back')
      }

      user.update({ isAdmin: !user.isAdmin })
      req.flash('success_messages', '使用者權限變更成功')
      return res.redirect('/admin/users')
    })
  }
}



module.exports = adminController
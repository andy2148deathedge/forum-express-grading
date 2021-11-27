const db = require('../models')
const adminService = require('../services/adminService')
const Category = db.Category

const categoryService = require('../services/categoryService')

let categoryController = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, data => 
      res.render('admin/categories', data )
    )
  }, // 已改

  postCategory: (req, res) => {
    categoryService.postCategory(req, res, data => {
      if (data['status'] === 'error')
      return res.redirect('back')

      req.flash('success_messages', data['message'])
      return res.redirect('/admin/categories')
    })
  }, // 已改

  putCategory: (req, res) => {
    categoryService.putCategory(req, res, data => {
      if (data['status'] === 'error')
      return res.redirect('back')

      req.flash('success_messages', data['message'])
      return res.redirect('/admin/categories')
    })
  }, // 已改

  deleteCategory: (req, res) => {
    categoryService.deleteCategory(req, res, data => {
      req.flash('success_messages', data['message'])
      return res.redirect('/admin/categories')
    })
  } // 已改
}

module.exports = categoryController
const db = require('../../models')
const Category = db.Category

const categoryService = require('../../services/categoryService')

let categoryController = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, data => 
      res.json(data)
    )
  },

}

module.exports = categoryController
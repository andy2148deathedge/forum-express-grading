const db = require('../models')
const Category = db.Category

let categoryService = {
  getCategories: (req, res, cb) => {
    return Category.findAll({raw: true, nest: true})
    .then(categories => {
      if (req.params.id) {
        Category.findByPk(req.params.id)
          .then(category => cb(
            {
              categories,
              category: category.toJSON()
            }
          ))
      } else {
        cb({ categories })
      }
    })
  },

  postCategory: (req, res, cb) => {
    if (!req.body.name) {
      return cb({ status: 'error', message: 'name didn\'t exist' })
    } else {
      return Category.create({
        name: req.body.name
      })
      .then(category => cb({ status: 'success', message: 'category created!' }))
    }
  },

  putCategory: (req, res, cb) => {
    if (!req.body.name) {
      return cb({ status: 'error', message: 'name didn\'t exist' })
    } else {
      return Category.findByPk(req.params.id)
        .then(category => category.update(req.body)
            .then(category => cb({ status: 'success', message: 'category edited!' }))
        )
    }
  },

  deleteCategory: (req, res, cb) => {
    return Category.findByPk(req.params.id)
      .then(category => category.destroy()
        .then(category => cb({ status: 'success', message: 'category deleted!' }))
      )
  }
}

module.exports = categoryService
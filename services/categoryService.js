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

}

module.exports = categoryService
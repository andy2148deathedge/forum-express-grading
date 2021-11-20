const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const pageLimit = 10
const restController = {
  getRestaurants: (req, res) => {
    let offset = 0 // offset pointer as an arg of method Table.findAndCountAll() 
    const whereQuery = {}
    let categoryId = ''

    if (req.query.page) offset = (req.query.page - 1) * pageLimit // 偏移量(之前頁面筆數)
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.CategoryId = categoryId
    }

    Restaurant.findAndCountAll({
      include: Category, 
      where: whereQuery,
      offset,
      limit: pageLimit
    })
    .then(result => {
      // pagination
      const page = Number(req.query.page) || 1 // 現在的頁面
      const pages = Math.ceil(result.count / pageLimit) // 總頁面數
      const totalPage = Array.from({ length: pages }) // 用來顯示頁數陣列
        .map((item, index) => ++index ) // 將該陣列 index做 +1 修正
      const prev = page - 1 < 1 ? 1 : page - 1 // 前一頁頁數
      const next = page + 1 > pages ? pages : page + 1 // 後一頁頁數 
      // leaned restaurant data
      const data = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.Category.name
      }))

      // process
      Category.findAll({
        raw: true,
        nest: true
      }).then(categories =>{
        return res.render('restaurants', {
          restaurants: data,
          categories,
          categoryId,
          page,
          totalPage,
          prev,
          next
        })
      })
    })
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { include: Category })
      .then(restaurant => res.render('restaurant', { restaurant: restaurant.toJSON() }))
  }

}
module.exports = restController 
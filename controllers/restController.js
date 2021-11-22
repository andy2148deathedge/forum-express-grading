const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User

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
        categoryName: r.Category.name,
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id)
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
    return Restaurant.findByPk(req.params.id, { 
      include: [ 
        Category, 
        { model: User, as: 'FavoritedUsers' },
        { model: Comment, include: [User] }
      ] 
    })
    .then(restaurant => restaurant.increment('viewCounts'))
    .then(restaurant => {
     const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
     return res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited })
    })
    .catch(err => res.redirect('back'))
  },

  getDashBoard: (req, res) => {
    return Restaurant.findByPk(req.params.id, { 
      include: [ Category, { model: Comment }] 
    })
    .then(restaurant => res.render('dashboard', { restaurant: restaurant.toJSON() }))
    .catch(err => res.redirect('back'))
  },

  getFeeds: (req, res) => {
    return Promise.all([ Restaurant.findAll({
      limit: 10,
      raw: true, 
      nest: true,
      order: [['createdAt', 'DESC']],
      include: [Category]
    }), Comment.findAll({
      limit: 10,
      raw: true, 
      nest: true,
      order: [['createdAt', 'DESC']],
      include: [User, Restaurant]
    }) ])
    .then(([restaurants, comments]) => {
      return res.render('feeds', { restaurants, comments })
    })
  }

}
module.exports = restController 
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant
const Comment = db.Comment
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
// const restaurant = require('../models/restaurant')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  // signin, signup
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    if(req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次輸入密碼不同!')
      return res.redirect('/signup')
    } else {
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複!')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號!')
            return res.redirect('/signin')
          })
        }
      })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')  
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入!')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '成功登出!')
    req.logout()
    res.redirect('/signin')
  },

  // profile
  getUser: (req, res) => {
    return User.findByPk(req.params.id, { include: { model: Comment, include: Restaurant }})
    .then(user => res.render('profile', { user: user.toJSON() }))
    .catch(err => res.redirect('back') )
  },

  editUser: (req, res) => {
    if ( Number(req.params.id) !== helpers.getUser(req).id ) {
      req.flash('error_messages', '無權對該用戶profile進行操作!')
      return res.redirect(`/users/${helpers.getUser(req).id}`)
    }

    return User.findByPk(req.params.id)
      .then(user => res.render('edit', { user: user.toJSON() }))
      .catch(err => res.redirect('back') )
  },

  putUser: async (req, res) => {
    try {
      // name chk
      if (!req.body.name) {
        req.flash('error_messages', '未輸入名字!')
        return res.redirect('back')
      }

      // if file or not
      const { file } = req
      if (file) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        imgur.upload(file.path, async (err, img) => {
          const user = await User.findByPk(req.params.id)
          await user.update({
            ...req.body,
            image: file ? img.data.link : user.image
          })
        })
      } else {
        const user = await User.findByPk(req.params.id)
        await user.update({
          ...req.body,
          image: user.image
        })
      }

      // redirect
      req.flash('success_messages', '使用者資料編輯成功')
      return res.redirect(`/users/${req.params.id}`)
    } 
    
    catch (err) {
      req.flash('error_messages', 'oops! Something wrong in profile editing.')
      return res.redirect('back')
    }
  },

  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
    .then(restaurant => res.redirect('back') )
  },

  removeFavorite: (req, res) => {
    return Favorite.destroy({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
    .then(favorite => res.redirect('back') )
  },

  addLike: (req, res) => {
    return Like.create({
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId
    })
    .then(restaurant => res.redirect('back') )
  },

  removeLike: (req, res) => {
    return Like.destroy({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      }
    })
    .then( restaurant => res.redirect('back') )    
  },

  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
    .then(followship => {
      return res.redirect('back')
    })
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({where: {
      followerId: req.user.id,
      followingId: req.params.userId
    } })
    .then(followship => {
      followship.destroy()
      .then(followship => res.redirect('back'))
    })
  },

  getTopUser: (req, res) => {
    // 先撈所有帶有 Followers 的 Users table 資料
    return User.findAll({ include: [ { model: User, as: 'Followers' } ] })
    .then(users => {
      // 整理撈到的 users 資料，製作 users 陣列
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length, // 計算追蹤人數
        isFollowed: req.user.Followings.map(dataUser => dataUser.id).includes(user.id) // 比對當前使用者是否追蹤該 user
      }))

      // 整理並得到 users array 後對該 array 進行需要的排序 (按人氣)
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)

      // 渲染
      return res.render('topUser', { users })
    })
  }
}

module.exports = userController
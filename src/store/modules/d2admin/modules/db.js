import db from '@/libs/db.js'
import util from '@/libs/util.js'

/**
 * @description 检查路径是否存在 不存在的话初始化
 * @param {Object} param dbName {String} 数据库名称
 * @param {Object} param path {String} 路径
 * @param {Object} param user {Boolean} 区分用户
 * @param {Object} param validator {Function} 数据校验钩子 返回 true 表示验证通过
 * @param {Object} param defaultValue {*} 初始化默认值
 * @returns {String} 可以直接使用的路径
 */
function pathInit ({
  dbName = 'db',
  path = '',
  user = true,
  validator = () => true,
  defaultValue = ''
}) {
  const uuid = util.cookies.get('uuid') || 'ghost-uuid'
  const currentPath = `${dbName}.${user ? `user.${uuid}` : 'public'}${path ? `.${path}` : ''}`
  const value = db.get(currentPath).value()
  if (!(value && validator(value))) {
    db
      .set(currentPath, defaultValue)
      .write()
  }
  return currentPath
}

export default {
  namespaced: true,
  mutations: {
    /**
     * @description 将数据存储到指定位置 | 路径不存在会自动初始化
     * @description 效果类似于 dbName.path = value
     * @param {Object} state vuex state
     * @param {Object} param dbName {String} 数据库名称
     * @param {Object} param path {String} 存储路径
     * @param {Object} param value {*} 需要存储的值
     */
    set (state, {
      dbName = 'db',
      path = '',
      value = ''
    }) {
      db.set(pathInit({
        dbName,
        path,
        user: false
      }), value).write()
    },
    /**
     * @description 将数据存储到指定位置 | 路径不存在会自动初始化 [区分用户]
     * @description 效果类似于 dbName.path[user] = value
     * @param {Object} state vuex state
     * @param {Object} param dbName {String} 数据库名称
     * @param {Object} param path {String} 存储路径
     * @param {Object} param value {*} 需要存储的值
     */
    setByUser (state, {
      dbName = 'db',
      path = '',
      value = ''
    }) {
      db.set(pathInit({
        dbName,
        path
      }), value).write()
    }
  },
  actions: {
    /**
     * @description 获取存储数据库对象
     */
    database () {
      return new Promise(resolve => {
        resolve(db.get(pathInit({
          dbName: 'database',
          user: false,
          defaultValue: {}
        })))
      })
    },
    /**
     * @description 清空存储数据库对象
     */
    databaseClear () {
      return new Promise(resolve => {
        resolve(db.get(pathInit({
          dbName: 'database',
          user: false,
          validator: () => false,
          defaultValue: {}
        })))
      })
    },
    /**
     * @description 获取存储数据库对象 [区分用户]
     */
    databaseByUser () {
      return new Promise(resolve => {
        resolve(db.get(pathInit({
          dbName: 'database',
          user: true,
          defaultValue: {}
        })))
      })
    },
    /**
     * @description 清空存储数据库对象 [区分用户]
     */
    databaseByUserClear () {
      return new Promise(resolve => {
        resolve(db.get(pathInit({
          dbName: 'database',
          user: true,
          validator: () => false,
          defaultValue: {}
        })))
      })
    },
    /**
     * @description 获取数据
     * @description 效果类似于 dbName.path || defaultValue
     * @param {Object} state vuex state
     * @param {Object} param dbName {String} 数据库名称
     * @param {Object} param path {String} 存储路径
     * @param {Object} param defaultValue {*} 取值失败的默认值
     */
    get (context, {
      dbName = 'db',
      path = '',
      defaultValue = ''
    }) {
      return new Promise(resolve => {
        resolve(db.get(pathInit({
          dbName,
          path,
          user: false,
          defaultValue
        })).value())
      })
    },
    /**
     * @description 获取数据 [区分用户]
     * @description 效果类似于 dbName.path[user] || defaultValue
     * @param {Object} state vuex state
     * @param {Object} param dbName {String} 数据库名称
     * @param {Object} param path {String} 存储路径
     * @param {Object} param defaultValue {*} 取值失败的默认值
     */
    getByUser (context, {
      dbName = 'db',
      path = '',
      defaultValue = ''
    }) {
      return new Promise((resolve, reject) => {
        resolve(db.get(pathInit({
          dbName,
          path,
          user: true,
          defaultValue
        })).value())
      })
    }
  }
}

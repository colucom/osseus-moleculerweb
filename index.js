const path = require("path")

const init = (osseus) => {
  this.osseus = osseus
  return new Promise(async (resolve, reject) => {
    try {
      const moleculer = await require(path.join(
        __dirname,
        "/lib/moleculer-web"
      ))(osseus)

      this.moleculer = moleculer

      resolve(this)
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = {
  init: init,
}

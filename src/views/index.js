import Pages from './pages'

export default {
  init() {
    console.log('init views')

    this.home = new Pages.Home()
  }
}
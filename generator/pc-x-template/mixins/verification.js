export const mixinsVerification = {
  data () {
    return {
      captchaSrc: '/apiApp/captcha?',
      timer: true
    }
  },
  methods: {
    refresh () {
      if (!this.timer) return
      this.captchaSrc = '/apiApp/captcha?' + new Date().getTime()
      this.timer = false
      setTimeout(() => (this.timer = true), 1500)
    }
  }
}

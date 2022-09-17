const self = module.exports = {
    saltRounds: 12,
    jwtSecret: '5ebe2294ecd0e0f08eab7690d2a6ee69',
    tokenExpiresIn: 7 * 24 * 60 * 60,
    get refreshTokenExpiresIn() {
      return 24 * 60 * self.tokenExpiresIn
    },
    defaultProfile: 'https://s3.ap-south-1.amazonaws.com/zepkart/default/default-profile.jpeg',
    otpExpiresIn: 1 * 5 * 60 * 1000,
    msgTitle: 'ZEPKART',
    countryCode: '91',
    phoneIcon: "file://s3.ap-south-1.amazonaws.com/zepkart/icons/phone.png",
    emailIcon: "file://s3.ap-south-1.amazonaws.com/zepkart/icons/email.png",
    logo: "file://s3.ap-south-1.amazonaws.com/zepkart/icons/logo.png",
    notification: {
      priority: "high",
      ttl: 24 * 60 * 60,
    },
    emailer: {
      mobile: "https://s3.ap-south-1.amazonaws.com/zepkart/emailer/mobile.png",
      zepkart: "https://s3.ap-south-1.amazonaws.com/zepkart/emailer/cart.png",
      top: "https://s3.ap-south-1.amazonaws.com/zepkart/emailer/top.jpg"
    }
  };
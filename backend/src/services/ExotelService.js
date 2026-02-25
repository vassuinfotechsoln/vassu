// Example: Replace Twilio with Exotel (Indian VoIP provider)
const axios = require('axios');

class ExotelService {
  constructor() {
    this.accountSid = process.env.EXOTEL_SID;
    this.token = process.env.EXOTEL_TOKEN;
    this.subdomain = process.env.EXOTEL_SUBDOMAIN;
  }

  async makeCall(to, from, callbackUrl) {
    try {
      const response = await axios.post(
        `https://${this.subdomain}.exotel.com/v1/Accounts/${this.accountSid}/Calls/connect.json`,
        {
          From: from,
          To: to,
          Url: callbackUrl
        },
        {
          auth: {
            username: this.accountSid,
            password: this.token
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ExotelService;
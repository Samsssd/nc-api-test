var SibApiV3Sdk = require("sib-api-v3-sdk");
var defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
var apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_KEY;

// Uncomment below two lines to configure authorization using: partner-key
// var partnerKey = defaultClient.authentications['partner-key'];
// partnerKey.apiKey = 'YOUR API KEY';

var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

const sendTestEmail = async (templateId, recipient, recipientName, nameParam, codeParam) => {
  sendSmtpEmail = {
    to: [
      {
        email: recipient,
        name: recipientName,
      },
    ],
    templateId: templateId,
    params: {
      name: nameParam,
	  code: codeParam,
    },
    headers: {
      "X-Mailin-custom":
        "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
    },
  };

  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      console.log("API called successfully. Returned data: " + data);
    },
    function (error) {
      console.error(error);
    }
  );
};

const sendTestos = () => {sendTestEmail(1, "djoudersamy@gmail.com", "Samy Djouder", "Samy", "Djouder")}

module.exports = { sendTestEmail, sendTestos };

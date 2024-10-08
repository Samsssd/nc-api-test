const User = require("../models/userModel");
const Seller = require("../models/sellerModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendTestEmail } = require("../middleware/emailMiddleware");

/**
 * @desc    Generate JWT token
 * @param   {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "60d",
  });
};

/**
 * @desc    Authenticate user or seller & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ "login.email": email });

  // Check for seller if user not found
  const seller = user
    ? null
    : await Seller.findOne({ "generalInfo.email": email });

  if (user && (await bcrypt.compare(password, user.login.password))) {
    const token = generateToken(user._id);
    res.status(200).json({
      token: token,
      userType: "user",
      userId: user._id,
    });
  } else if (
    seller &&
    (await bcrypt.compare(password, seller.loginInfo.password))
  ) {
    const token = generateToken(seller._id);
    res.status(200).json({
      token: token,
      userType: "seller",
      userId: seller._id,
    });
  } else {
    res.status(401).json({ message: "Email ou mot de passe incorrects." });
  }
});

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body.login;

  // Vérifier si l'email est déjà utilisé
  const emailExists = await User.findOne({ "login.email": email });
  if (emailExists) {
    res.status(400).json({
      message: "Cette adresse mail est déjà utilisée par un autre compte.",
    });
  }
  const usernameExists = await User.findOne({
    "info.username": req.body.info.username,
  });
  if (usernameExists) {
    res.status(400).json({
      message: "Ce nom d'utilisateur est déjà utilisé par un autre compte.",
    });
  }

  if (!usernameExists && !emailExists) {
    // Hash le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generer Mot de passe de verification email
    // const emailPwd = Math.random().toString(36).slice(-8);
    const emailPwd = Math.floor(100000 + Math.random() * 900000);

    const user = await User.create({
      login: {
        email: req.body.login.email,
        password: hashedPassword,
      },
      info: req.body.info,
      wishlist: [],
      orders: [],
      notifications: [],
      misc: {
        isFirstTimeLogin: true,
        isVerified: false,
        verificationCode: emailPwd,
        hasSubscribedNewsletter: req.body.misc.hasSubscribedNewsletter,
      },
    });

    if (user) {
      // send mail with defined transport object
      // let info = await transporter.sendMail({
      //   from: "contact@my-offtime.com",
      //   to: req.body.login.email,
      //   subject: "Votre Code de Vérification Off-Time",
      //   text: `Votre Code est: ${emailPwd}`, // plain text body
      //   html: `<b>Votre Code est: ${emailPwd}</b>`, // html body
      // });
      await sendTestEmail(
        1,
        user.login.email,
        user.info.firstName,
        user.info.firstName,
        user.misc.verificationCode
      );
      res.status(201).json({
        email: user.login.email,
        _id: user.id,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({
        message: "Une erreur est survenue. Impossible de créer le compte.",
      });
    }
  }
});

/**
 * @desc    Register a new seller
 * @route   POST /api/v1/auth/register-seller
 * @access  Public
 */
const registerSeller = asyncHandler(async (req, res) => {
  const { email, password } = req.body.loginInfo;

  // Check if the email is already used
  const emailExists = await Seller.findOne({ "generalInfo.email": email });
  if (emailExists) {
    return res.status(400).json({
      message:
        "Cette adresse mail est déjà utilisée par un autre compte vendeur.",
    });
  }

  // Check if the username is already used
  const usernameExists = await Seller.findOne({
    "generalInfo.username": req.body.generalInfo.username,
  });
  if (usernameExists) {
    return res.status(400).json({
      message:
        "Ce nom d'utilisateur est déjà utilisé par un autre compte vendeur.",
    });
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate email verification code
  const emailVerificationCode = Math.floor(100000 + Math.random() * 900000);

  const seller = await Seller.create({
    loginInfo: {
      password: hashedPassword,
    },
    generalInfo: {
      ...req.body.generalInfo,
      email: email,
    },
    address: req.body.address,
    preferredCategories: req.body.preferredCategories || [],
    shippingMethods: req.body.shippingMethods || [],
    returnPolicy: req.body.returnPolicy || "",
    isVerified: false,
    verificationCode: emailVerificationCode,
  });

  if (seller) {
    // Send verification email
    await sendTestEmail(
      2,
      seller.generalInfo.email,
      seller.generalInfo.businessName,
      seller.generalInfo.username,
      emailVerificationCode
    );

    res.status(201).json({
      email: seller.generalInfo.email,
      _id: seller.id,
      token: generateToken(seller._id),
    });
  } else {
    res.status(400).json({
      message:
        "Une erreur est survenue. Impossible de créer le compte vendeur.",
    });
  }
});

/**
 * @desc    Change user password
 * @route   PUT /api/v1/auth/password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  //Comparer le mot de passe
  if (await bcrypt.compare(req.body.oldPwd, user.login.password)) {
    // Hash le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.newPwd, salt);
    user.login.password = hashedPassword;
    res.status(200).json({ message: "success" });
    await user.save();
  } else {
    res.status(400).json({ message: "invalid password" });
  }
});

/**
 * @desc    Check if email is already in use
 * @route   POST /api/v1/auth/checkemail
 * @access  Public
 */
const checkIfEmailIsUsed = asyncHandler(async (req, res) => {
  const userEmail = await User.findOne({ "login.email": req.body.email });
  const sellerEmail = await Seller.findOne({ "generalInfo.email": req.body.email });

  if (userEmail || sellerEmail) {
    res.status(200).json({
      result: "error",
      message: "Cette adresse mail est déjà utilisée par un autre compte.",
    });
  } else {
    res.status(200).json({
      result: "success",
      message: "Cette adresse mail est disponible.",
    });
  }
});

/**
 * @desc    Check if username is already in use
 * @route   POST /api/v1/auth/checkusername
 * @access  Public
 */
const checkIfUsernameIsUsed = asyncHandler(async (req, res) => {
  const userUsername = await User.findOne({ "info.username": req.body.username });
  const sellerUsername = await Seller.findOne({ "generalInfo.username": req.body.username });

  if (userUsername || sellerUsername) {
    res.status(200).json({
      result: "error",
      message: "Ce nom d'utilisateur est déjà utilisé par un autre compte.",
    });
  } else {
    res.status(200).json({
      result: "success",
      message: "Ce nom d'utilisateur est disponible.",
    });
  }
});

module.exports = {
  loginUser,
  registerUser,
  changePassword,
  checkIfEmailIsUsed,
  checkIfUsernameIsUsed,
  registerSeller,
};

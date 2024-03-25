const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Générer un JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "60d",
  });
};

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //Chercher par email
  const user = await User.findOne({ "login.email": email });
  //Comparer le mot de passe
  if (user && (await bcrypt.compare(password, user.login.password))) {
    const token = generateToken(user._id);
    res.status(201).json({ token: token });
  } else {
    res.status(400).json({ message: `Email ou mot de passe incorrects.` });
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body.login;

  // Vérifier si l'email est déjà utilisé
  const emailExists = await User.findOne({ "login.email": email });
  if (emailExists) {
    res.status(400).json({
      message: "Cette adresse mail est déjà utilisée par un autre compte.",
    });
  }
  const usernameExists = await User.findOne({ "info.username": req.body.info.username });
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
    const emailPwd = Math.random().toString(36).slice(-8);

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
        hasSubscribedNewsletter: req.body.misc.hasSubscribedNewsletter
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

const checkIfEmailIsUsed = asyncHandler(async (req, res) => {
  const email = await User.find({ "login.email": req.body.email });
  if (email) {
    res.status(400).json({
      message: "Cette adresse mail est déjà utilisée par un autre compte.",
    });
  } else {
    res.status(200).json({
      message: "good to go",
    });
  }
});

module.exports = { loginUser, registerUser };

const jsonwebtoken = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const pathToKey = path.join(__dirname, "..", "id_rsa_priv.pem");
const PRIV_KEY = fs.readFileSync(pathToKey, "utf8");
const pathToPubKey = path.join(__dirname, "..", "id_rsa_pub.pem");
const PUB_KEY = fs.readFileSync(pathToPubKey, "utf8");

function issueJWT(user) {
  const _id = user._id;

  const expiresIn = "1d";

  const payload = {
    sub: _id,
    iat: Date.now(),
  };

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, {
    expiresIn: expiresIn,
    algorithm: "RS256",
  });

  return {
    token: "Bearer " + signedToken,
    expires: expiresIn,
  };
}

function verifyJWT(req, res, next) {
  let tokenParts;
  if (req.headers.authorization) {
    tokenParts = req.headers.authorization.split(" ");
  } else {
    res.status(401).json({
      message: "You are not allowed to visit this page",
    });
  }

  if (
    tokenParts[0] === "Bearer" &&
    tokenParts[1].match(/\S+\.\S+\.\S+/) !== null
  ) {
    try {
      const verification = jsonwebtoken.verify(tokenParts[1], PUB_KEY, {
        algorithms: ["RS256"],
      });
      req.jwt = verification;
      next();
    } catch (err) {
      res
        .status(401)
        .json({ message: "You are not allowed to visit this page" });
    }
  } else {
    res.status(401).json({
      message: "You are not allowed to visit this page",
    });
  }
}

exports.issueJWT = issueJWT;
exports.verifyJWT = verifyJWT;

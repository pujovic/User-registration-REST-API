//Data validation functions
function isValidName(value, minLength = 3) {
  return value && value.trim().length >= minLength;
}

function isValidUserName(value, minLength = 3) {
  const isValid = /^\w+[^@]$/.test(value);
  return value && value.trim().length >= minLength && isValid;
}

function isValidPassword(value, minLength = 8) {
  return value && value.trim().length >= minLength;
}

function isValidEmail(value) {
  const isValid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
  return value && isValid;
}

exports.isValidUserName = isValidUserName;
exports.isValidPassword = isValidPassword;
exports.isValidName = isValidName;
exports.isValidEmail = isValidEmail;

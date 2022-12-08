"use-strict";

// check arguments so that there is no error thrown at runtime; synchronously
module.exports.checkArgs = function (...args) {
  args.forEach(function (arg) {
    if (arg && !args instanceof String) {
      throw new IllegalArgumentError(`${arg} must be a String`);
    }
  });
};

// check arguments so that there is no error thrown at runtime; asynchronously
module.exports.checkArgsP = async function (...args) {
  args.forEach(function (arg) {
    if (arg && !args instanceof String) {
      throw new IllegalArgumentError(`${arg} must be a String`);
    }
  });

  return args.length;
};

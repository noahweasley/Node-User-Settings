/**
 * MIT License
 *
 * Copyright (c) 2022 Noah
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 **/

"use-strict";

const { IllegalArgumentError } = require("./error");

/**
 * @throws {IllegalArgumentError} if the callback is undefined
 */
module.exports.requireFunction = function () {
  throw new IllegalArgumentError("Callback function is required");
};

/**
 * Validates a list of strings
 *
 * @param  {string[]} strings the argument in which the type would be checked
 */
module.exports.validateStrings = function (...strings) {
  strings.forEach((string) => {
    if (!(typeof string === "string")) {
      throw new IllegalArgumentError(`${string} must be a String`);
    }
  });
};

/**
 * Validates an array
 *
 * @param {Array} array the argument in which the type would bec checked
 */
module.exports.validateArray = function (array) {
  if (!(array && Array.isArray(array))) throw new IllegalArgumentError("array is not of type [Array]");
};

/**
 * Validates an object, the keys and the values. If schema is not provided, the object would only be checked if it exists
 *
 * @param object the object that will get validated
 * @param schema the schema in which validator will use to check if the object is the correct argument
 */
module.exports.validateObject = function (object, schema) {
  if (!(schema && object)) throw new IllegalArgumentError("Argument is required");

  const errors = Object.keys(schema)
    .filter((key) => !schema[key](object[key]))
    .map((key) => new IllegalArgumentError(`${key} is invalid`));

  if (errors.length > 0) {
    errors.forEach((error) => {
      throw error;
    });
  }
};

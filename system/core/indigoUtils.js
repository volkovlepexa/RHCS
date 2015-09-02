/**
 * Utils.getUnixTimestamp - just return unix timestamp is seconds
 * @returns {Integer} Seconds since 1 Jan 1970
 */
module.exports.getUnixTimestamp = function () {

  return Math.floor(Date.now() / 1000);

}
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const extractUrls = (text) => {
  const urlRegex = /https?:\/\/[^\s]+/;
  let match;
  const urls = [];
  if ((match = urlRegex.exec(text))!== null) {
    urls.push(match[0]);
  }
  return urls;
}


module.exports = {
  formatTime,
  extractUrls
}


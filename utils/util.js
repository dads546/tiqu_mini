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
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  let match;
  const urls = [];
  while ((match = urlRegex.exec(text))!== null) {
    urls.push(match[0]);
  }
  return urls;
}


module.exports = {
  formatTime,
  extractUrls
}


// 随机取n个元素
export function getRandomList(arr, n) {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

// 按like数从大到小取前n个元素
export function getTopByLike(arr, n) {
  const sorted = arr.sort((a, b) => b.like - a.like);
  return sorted.slice(0, n);
}

// 按创建时间排序
export function sortByCreated(arr) {
  return arr.sort((a, b) => new Date(a.created) - new Date(b.created));
}

// 判断日期是否为昨天
export function isYesterday(date) {
  const today = new Date();
  const yesterDate = new Date(today.setDate(today.getDate() - 1)).toDateString();
  return date.toDateString() === yesterDate;
}

// 判断日期是否为今天
export function isToday(date) {
  const today = new Date().toDateString();
  return date.toDateString() === today;
}

// 获取日期所在周的周数
export function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDays = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
}

// 当天数据
export function getNewlyAddedIdeas(arr){
  const todayNewIdeas = arr.filter(item => isToday(new Date(item.created)));
  const sortedIdeas = sortByCreated(todayNewIdeas);
  return sortedIdeas;
}
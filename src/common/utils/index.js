const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
const dateTime = () => {
  const d = new Date();
  // yyyy-MM-dd hh:mm:ss
  const yyyy = d.getFullYear();
  const MM = ("0" + (d.getMonth() + 1)).slice(-2);
  const dd = ("0" + d.getDate()).slice(-2);
  const hh = ("0" + d.getHours()).slice(-2);
  const mm = ("0" + d.getMinutes()).slice(-2);
  const ss = ("0" + d.getSeconds()).slice(-2);
  return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
};

const exceptUniq = (array) => {
  const uniq = [];
  array.forEach((item) => {
    if (!uniq.includes(item)) {
      uniq.push(item);
    }
  });
  return uniq;
};

export default { sleep, dateTime, exceptUniq };

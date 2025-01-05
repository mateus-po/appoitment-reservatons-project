module.exports.parseDate = (date: string) => {
    const parsedDate = new Date(date + "T00:00:00.000Z");
  
    const day = parsedDate.getUTCDate();
    const month = parsedDate.getUTCMonth() + 1;
    const year = parsedDate.getUTCFullYear();
  
    return `${year}-${month > 9 ? month : "0" + month}-${
      day > 9 ? day : "0" + day
    }`;
  };
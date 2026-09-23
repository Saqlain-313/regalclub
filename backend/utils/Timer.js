exports.timerJoin=(params = "", addHours = 0)=> {
    let date = params ? new Date(Number(params)) : new Date();
    if (addHours !== 0) {
      date.setHours(date.getHours() + addHours);
    }
  
    const options = {
      timeZone: "Asia/Kolkata", // Specify the desired time zone
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // 24-hour format
    };
  
    const formatter = new Intl.DateTimeFormat("en-GB", options);
    const parts = formatter.formatToParts(date);
  
    const getPart = (type) => parts.find((part) => part.type === type).value;
  
    const formattedDate = `${getPart("year")}-${getPart("month")}-${getPart(
      "day"
    )} ${getPart("hour")}:${getPart("minute")}:${getPart("second")}`;
  
    return formattedDate;
  }

  
exports.timerJoinToday=(params = "", addHours = 0)=> {
    let date = params ? new Date(Number(params)) : new Date();
    if (addHours !== 0) {
      date.setHours(date.getHours() + addHours);
    }
  
    const options = {
      timeZone: "Asia/Kolkata", // Specify the desired time zone
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // 24-hour format
    };
  
    const formatter = new Intl.DateTimeFormat("en-GB", options);
    const parts = formatter.formatToParts(date);
  
    const getPart = (type) => parts.find((part) => part.type === type).value;
  
    const formattedDate = `${getPart("year")}-${getPart("month")}`;
  
    return formattedDate;
  }
  
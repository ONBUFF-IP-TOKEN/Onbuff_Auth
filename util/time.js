function parseMinute( minute ){
    if (minute < 10) {
        return "0" + minute;
    } else {
        return minute;
    }
}

exports.getTime = function() {
    var date = new Date();
    var time;
    if (date.getHours() <= 12) {
        time = "오전 " + date.getHours() + ":" + parseMinute(date.getMinutes());
    } else {
        time = "오후 " + (date.getHours() - 12) + ":" + parseMinute(date.getMinutes());
    }
    return time;
}

exports.makeUrl = function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 20; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
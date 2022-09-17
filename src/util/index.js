module.exports = {
    capitilizeFirst: (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    initCap: (string) => {
        console.log('str :------>', string);
        string = string.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
        return string;
    },

    generateOTP: () => {
        return Math.floor(1000 + Math.random() * 9000);
    }
}
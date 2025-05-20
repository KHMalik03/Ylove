function formatDateForMySQL(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    return date.toISOString().slice(0, 19).replace('T', ' ');
}
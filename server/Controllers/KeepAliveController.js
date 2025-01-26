module.exports.keepAlive = (req, res) => {
    return res.status(200).json({ message: 'Keep alive' });
}
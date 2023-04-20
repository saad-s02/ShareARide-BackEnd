exports.encryptMsg = (msg) => {

    try{
        var crypto = require('crypto')
        var cipher = crypto.createCipher('aes-128-ecb','carpool12carpool')
        var crypted = cipher.update(msg,'utf-8','hex')
        crypted += cipher.final('hex')
        //console.log(crypted)
        //res.status(201).json({ message: crypted });
        return crypted;
        
    } catch (error) {
        console.log("Something went wrong, please try again", error);
    }

};

exports.decryptMsg = (msg) => {

    try{
        var crypto = require('crypto')
        var decipher = crypto.createDecipher('aes-128-ecb','carpool12carpool')
        var decrypted = decipher.update(msg,'hex','utf-8')
        decrypted += decipher.final('utf-8')
        //console.log(crypted)

        var decryptedjson = JSON.parse(decrypted);

        //res.status(201).json(decryptedjson);
        return decryptedjson;
        
    } catch (error) {
        console.log("Something went wrong, please try again", error);
    }

};
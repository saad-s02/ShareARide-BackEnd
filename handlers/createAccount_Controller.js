const { db } = require("../util/admin");
const { encryptMsg } = require("./encryption");

// this function will create a document for the user with the parameters defined
const customerinformationDB = db.collection('CustomerInformationDB');

exports.registerUser = (data, res) => {
    try {
        //console.log(data);
        db.collection("CustomerInformationDB").doc(data.CUID).create({
            "cuid": data.CUID,
            "firstName": data.firstname,
            "lastName": data.lastname,
            "phoneNumber": data.phonenumber,
            "address": data.address,
            //"DiscordAuthToken": "",
            "DOB": data.DOB,
            "rating": "5.0",
            "num_ratings": 0,
            "friendRequestList": [],
            "friendList": [],
            "sentFriendRequestList": [],
            "email": data.email
        })
            .then((docRef) => {
                console.log("Document written with ID: ", data.CUID);
                res.status(201).json({ Message: "Registration successful!", UID: data.CUID });
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
    } catch (error) {
        console.log("Something went wrong, please try again", error);
    }
};

exports.getUserInfo = (CUID, res) => {
    try {
        //console.log(data);
        var docRef = customerinformationDB.doc(CUID);

        docRef.get()
            .then((doc) => {
                if (doc.exists) {
                    //console.log("Document data:", doc.data());
                    //console.log(doc.data().friendList);
                    console.log("Success retrieving user info");
                    return res.status(201).json(doc.data());
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                    return res.status(500).json({ Message: "No such document!" });
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });
    } catch (error) {
        console.log("Something went wrong, please try again", error);
    }
};
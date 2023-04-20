const { db, admin } = require("../util/admin");

// this function will create a document for the user with the parameters defined

const customerinformationDB = db.collection('CustomerInformationDB');

exports.getFriends = (CUID, res) => {
    try {
        //console.log(data);
        var docRef = customerinformationDB.doc(CUID);

        docRef.get()
            .then((doc) => {
                if (doc.exists) {
                    //console.log("Document data:", doc.data());
                    //console.log(doc.data().friendList);
                    console.log("Succcess retrieving friend list");
                    return res.status(201).json(doc.data().friendList);
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                    return res.status(500).json({ general: "Something went wrong, please try again" });
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });
    } catch (error) {
        console.log("Something went wrong, please try again", error);
    }
};

exports.sendFriendRequest = (data, res) => {
    try {
        console.log(data);
        var docRef_requestor = customerinformationDB.doc(data.requestor_CUID);
        var docRef_reciever = customerinformationDB.doc(data.reciever_CUID);

        docRef_requestor.update({
            sentFriendRequestList: admin.firestore.FieldValue.arrayUnion(data.reciever_CUID)
        });

        docRef_reciever.update({
            friendRequestList: admin.firestore.FieldValue.arrayUnion(data.requestor_CUID)
        });

        console.log("Succcess sending friend request");
        res.status(201).json({ general: "Friend request sent" });
    } catch (error) {
        console.log("Something went wrong, please try again", error);
        res.status(500).json({ general: "Something went wrong, please try again" });
    }
};

exports.getFriendRequests = (CUID, res) => {
    try {
        //console.log(data);
        var docRef = customerinformationDB.doc(CUID);

        docRef.get()
            .then((doc) => {
                if (doc.exists) {
                    console.log("Success retrieving friend requests");
                    return res.status(201).json(doc.data().friendRequestList);
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                    return res.status(500).json({ Message: "No such document!" });
                }
            }).catch((error) => {
                console.log("Error getting the list:", error);
            });
    } catch (error) {
        console.log("Something went wrong, please try again", error);
    }
};

exports.acceptFriendRequest = (data, res) => {
    try {
        console.log(data);
        var docRef_requestor = customerinformationDB.doc(data.requestor_CUID);
        var docRef_acceptor = customerinformationDB.doc(data.acceptor_CUID);

        docRef_requestor.update({
            sentFriendRequestList: admin.firestore.FieldValue.arrayRemove(data.acceptor_CUID)
        });

        docRef_requestor.update({
            friendList: admin.firestore.FieldValue.arrayUnion(data.acceptor_CUID)
        });

        docRef_acceptor.update({
            friendRequestList: admin.firestore.FieldValue.arrayRemove(data.requestor_CUID)
        });

        docRef_acceptor.update({
            friendList: admin.firestore.FieldValue.arrayUnion(data.requestor_CUID)
        });

        console.log("Succcess accepting friend request");
        res.status(201).json({ general: "Friend request accepted" });
    } catch (error) {
        console.log("Something went wrong, please try again", error);
        res.status(500).json({ general: "Something went wrong, please try again" });
    }
};

exports.declineFriendRequest = (data, res) => {
    try {
        console.log(data);
        var docRef_requestor = customerinformationDB.doc(data.requestor_CUID);
        var docRef_decliner = customerinformationDB.doc(data.decliner_CUID);

        docRef_requestor.update({
            sentFriendRequestList: admin.firestore.FieldValue.arrayRemove(data.decliner_CUID)
        });

        docRef_decliner.update({
            friendRequestList: admin.firestore.FieldValue.arrayRemove(data.requestor_CUID)
        });
        console.log("Succcess declining friend request");
        res.status(201).json({ general: "Friend request declined" });
    } catch (error) {
        console.log("Something went wrong, please try again", error);
        res.status(500).json({ general: "Something went wrong, please try again" });
    }
};

exports.removeFriend = (data, res) => {
    try {
        console.log(data);
        var docRef_remover = customerinformationDB.doc(data.remover_CUID);
        var docRef_removed = customerinformationDB.doc(data.removed_CUID);

        docRef_remover.update({
            friendList: admin.firestore.FieldValue.arrayRemove(data.removed_CUID)
        });

        docRef_removed.update({
            friendList: admin.firestore.FieldValue.arrayRemove(data.remover_CUID)
        });
        console.log("Succcess removing friend");
        res.status(201).json({ general: "Friend removed" });
    } catch (error) {
        console.log("Something went wrong, please try again", error);
        res.status(500).json({ general: "Something went wrong, please try again" });
    }
}

exports.searchFriends = (data, res) => {
    try {
        console.log(data);
        customerinformationDB.where("firstName","==",data.firstname).get()
            .then((docs) => {

                var potentialfriends = {};

                docs.forEach(doc => {
                    potentialfriends[doc.id] = doc.data();
                });
    
                console.log(potentialfriends);
                return res.status(201).json(potentialfriends);
            }).catch((error) => {
                console.log("Error getting the list:", error);
                return res.status(500).json({ Message: "Error getting the list:" });
            });
    } catch (error) {
        console.log("Something went wrong, please try again", error);
        return res.status(500).json({ Message: "Something went wrong, please try again" });
    }
}
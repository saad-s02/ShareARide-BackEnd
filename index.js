// things we need to import

var express = require('express');
var app = express();
const PORT = process.env.PORT || 5050
const { books } = require('./handlers/books')
const { registerUser, getUserInfo } = require('./handlers/createAccount_Controller')
const { getFriends, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend, getFriendRequests, searchFriends } = require('./handlers/addFriends_Controller')
const { deleteUser, editUserProfile, changePassword } = require('./handlers/profileEditing_Controller')
const { admin } = require("./util/admin");
const { firebase } = require("./util/firebase");
const bodyParser = require('body-parser');
const { rateUser } = require('./handlers/rating_Controller');
const { validateTaxiInfo, offertempCarpool, requestCarpool, getCarpoolRequests, getRideInfo, finishRide, startRide, requestJoinCarpool, offererFinishRide, acceptCarpoolRequest, declineCarpoolRequest } = require('./handlers/system_Controller');
const { encryptMsg, decryptMsg } = require('./handlers/encryption');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

///////////////////////////////////////////

// API CALLS

// testing api call
app.get('/books', books);

// api call for initialization
app.get('/', (req, res) => {
    res.send('The server is up and running.');
    console.log("SERVER UP AND WORKING.");
})

// API CALL for Creating an account  encryption done ///////////////////////// DONE
app.post('/registeraccount/', function (req, res) {
    //console.log(req.body);

    var decrypted = req.body

    let email = decrypted.email;
    let password = decrypted.password;
    let firstname = decrypted.firstname;
    let lastname = decrypted.lastname;
    let phonenumber = decrypted.phonenumber;
    let address = decrypted.address;
    let DOB = decrypted.DOB;

    admin.auth().createUser({
        email: email,
        password: password,
    }).then((userRecord) => {
        const user = userRecord.uid;

        var docData = {
            email: email,
            firstname: firstname,
            lastname: lastname,
            phonenumber: phonenumber,
            address: address,
            DOB: DOB,
            CUID: user
        };

        // call registerUser function with the data
        // this function will create a document for the user with the parameters defined

        registerUser(docData, res);

    })
        .catch((error) => {
            res.json({ Message: "failed" });
            console.log("failed", error);
        });
});

// API CALL for Logging in encryption done
app.post('/login/', function (req, res) {

    var decrypted = req.body

    let email = decrypted.email;
    let password = decrypted.password;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            var user = userCredential.user;
            res.json({ Message: "Login successful!", UID: user.uid });
            console.log("Login successful", user.uid);
            // ...
        })
        .catch((error) => {
            var errorMessage = error.message;
            res.json({ Message: "Login failed!" + errorMessage });
            console.log("Login failed", error);
        });
});

// API CALL for Logging out
app.post('/logout/', function (req, res) {
    firebase.auth().signOut().then(() => {
        res.send("Logout successful");
        console.log("Logout successful");
    }).catch((error) => {
        res.send("Logout failed");
        console.log("Logout failed", error);
    });
});

// API CALL for Getting a user's information encryption done
app.post('/getuserinfo/', function (req, res) {
    var decryptedstuff = req.body
    var UID = decryptedstuff.UID;
    getUserInfo(UID, res);
});

// API CALL for editing user profile encryption done
app.post('/editprofile', function (req, res) {

    var decrypted = req.body

    var Data = {
        CUID: decrypted.UID,
        firstName: decrypted.firstName,
        lastName: decrypted.lastName,
        phoneNumber: decrypted.phoneNumber,
        address: decrypted.address,
        DiscordAuthToken: decrypted.DiscordAuthToken,
        email: decrypted.email
    };
    editUserProfile(Data, res);
});

// API CALL for changing password
app.post('/updatepassword', function (req, res) {
    var Data = {
        CUID: req.body.CUID,
        newPassword: req.body.newPassword
    };
    changePassword(Data, res);
});
// API CALL for deleting user
app.post('/deleteuser/', function (req, res) {
    var UID = req.body.UID;
    deleteUser(UID, res);
});

// API CALL for Sending a friend request
app.post('/sendfriendrequest/', function (req, res) {
    var Data = {
        requestor_CUID: req.body.UID_requestor,
        reciever_CUID: req.body.UID_reciever
    };
    //console.log(Data);
    sendFriendRequest(Data, res);
});

// API CALL for getting the friend requests
app.post('/getfriendrequests/', function (req, res) {
    var UID = req.body.CUID;
    getFriendRequests(UID, res);
});

// API CALL for GET FRIENDS LIST
app.post('/getfriendslist/', function (req, res) {
    var UID = req.body.UID;
    getFriends(UID, res);
});

// API CALL for ACCEPTING a friend request
app.post('/acceptfriendrequest/', function (req, res) {
    var Data = {
        requestor_CUID: req.body.UID_requestor,
        acceptor_CUID: req.body.UID_acceptor
    };
    //console.log(Data);
    acceptFriendRequest(Data, res);
});

// API CALL for DECLINING a friend request
app.post('/declinefriendrequest/', function (req, res) {
    var Data = {
        requestor_CUID: req.body.UID_requestor,
        decliner_CUID: req.body.UID_decliner
    };
    //console.log(Data);
    declineFriendRequest(Data, res);
});

// API CALL for REMOVING a friend 
app.post('/removefriend/', function (req, res) {
    var Data = {
        remover_CUID: req.body.UID_remover,
        removed_CUID: req.body.UID_removed
    };
    //console.log(Data);
    removeFriend(Data, res);
});

// API CALL for rating a user
app.post('/rateuser', function (req, res) {
    var Data = {
        CUID: req.body.UID,
        rating: req.body.rating
    };
    rateUser(Data, res);
});

// API CALL for scanning qr code
app.post('/scanqrcode', function (req, res) {
    var qrcode = req.body.qrcode;
    validateTaxiInfo(qrcode, res);
});

// API CALL for offering temporary carpool
app.post('/offertempcarpool', function (req, res) {
    var Data = {
        taxi_qr_code: req.body.taxi_qr_code,
        CUID: req.body.offerer,
        start_location: req.body.start_location,
        start_location_id: req.body.start_location_id,
        end_location: req.body.end_location,
        end_location_id: req.body.end_location_id,
        maxriders: req.body.max_riders,
        stops: req.body.stops,
        ETA: req.body.ETA,
        riders: req.body.riders,
        distance: req.body.distance
    };
    offertempCarpool(Data, res);
});

// API CALL for requesting carpool needs work
app.post('/requestcarpool', function (req, res) {
    var Data = {
        CUID: req.body.requester,
        start_location: req.body.start_location,
        start_location_id: req.body.start_location_id,
        end_location: req.body.end_location,
        end_location_id: req.body.end_location_id,
        min_rating: req.body.min_rating,
        max_riders: req.body.max_riders,
    };
    requestCarpool(Data, res);
});

// API CALL for getting the carpool requests
app.post('/getcarpoolrequests/', function (req, res) {
    var RID = req.body.RideID;
    getCarpoolRequests(RID, res);
});

// API CALL for getting ride information
app.post('/getrideinfo/', function (req, res) {
    var RID = req.body.RideID;
    getRideInfo(RID, res);
});

//API CALL for finishing a ride
app.post('/finishride', function (req, res) {
    var Data = {
        RID: req.body.RideID,
        CUID: req.body.CUID,
    };
    finishRide(Data, res);
});


// API CALL for offerer finishing a ride
app.post('/offererfinishride', function (req, res) {
    var Data = {
        RID: req.body.RideID,
        CUID: req.body.CUID,
    };
    offererFinishRide(Data, res);
});

// API CALL for starting a ride
app.post('/startride', function (req, res) {
    var Data = {
        RID: req.body.RideID,
        CUID: req.body.CUID,
    };
    startRide(Data, res);
});

// API CALL for request to join a carpool
app.post('/requestjoincarpool', function (req, res) {
    var Data = {
        RID: req.body.RideID,
        CUID: req.body.CUID,
        pickup_locationid: req.body.pickup_locationid
    };
    requestJoinCarpool(Data, res);
});

// API Call for accepting carpool requester
app.post('/acceptcarpoolrequest', function (req, res) {
    var Data = {
        newDistance: req.body.newDistance,
        requesterCUID: req.body.requesterCUID,
        offererCUID: req.body.offererCUID,
        RID: req.body.rideID,
        newETA: req.body.newETA
    };
    acceptCarpoolRequest(Data, res);
});

// API Call for declining carpool requester
app.post('/declinecarpoolrequest', function (req, res) {
    var Data = {
        requesterCUID: req.body.requesterCUID,
        offererCUID: req.body.offererCUID,
        RID: req.body.rideID
    };
    declineCarpoolRequest(Data, res);
});

// API CALL search for friends
app.post('/searchfriends', function (req, res) {
    var Data = {
        "firstname": req.body.firstname,
    };
    searchFriends(Data, res);
});

























// testing encryption
app.get('/testencryption', function (req, res) {
    var test = JSON.stringify(req.body);
    console.log(test);
    var result = encryptMsg(test, res)
    console.log(result);
    res.json({ msg: result });
});

// testing decryption
app.get('/testdecryption', function (req, res) {
    var test = req.body.msg;
    console.log(test);
    decryptMsg(test, res).then(result => {
        console.log(result);
        res.json({ msg: result });
    });
});


app.listen(PORT, function () {
    console.log(`Demo project at: ${PORT}!`);
});
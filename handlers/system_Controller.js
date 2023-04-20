const { db } = require("../util/admin");
const { admin } = require("../util/admin");

// this function will create a document for the user with the parameters defined
const taxiinformationDB = db.collection('TaxiInformationDB');
const customerinformationDB = db.collection('CustomerInformationDB');
const rideinformationDB = db.collection('RideInformationDB');

exports.validateTaxiInfo = (qrcode, res) => {
    try {
        //console.log(data);
        var docRef = taxiinformationDB.doc(qrcode);

        docRef.get()
            .then((doc) => {
                if (doc.exists) {
                    //console.log("Document data:", doc.data());
                    //console.log(doc.data().friendList);
                    console.log("Success validating taxi info");
                    console.log("taxistatus:", doc.data().status);
                    return res.status(201).json({ taxistatus: doc.data().status });
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such taxi!");
                    return res.status(500).json({ general: "Something went wrong, please try again" });
                }
            }).catch((error) => {
                console.log("Error getting taxi:", error);
            });
    } catch (error) {
        console.log("Something went wrong, please try again", error);
    }
};


// need to fix fare calculations
exports.offertempCarpool = (data, res) => {
    try {
        //console.log(data);
        const rating_ref = customerinformationDB.doc(data.CUID);
        var rating;

        rating_ref.get().then(doc => {
            if (doc.exists) {
                //console.log("Document data:", doc.data());
                rating = doc.data().rating;
                var fare = (1.8 * data.distance) / data.riders.length;

                rideinformationDB.add({
                    "rideid": doc.id,
                    "ridetype": "tempoffer",
                    "taxicode": data.taxi_qr_code,
                    "maxriders": data.maxriders,
                    "offerer": data.CUID,
                    "requesterlist": {},
                    "riders": data.riders,
                    "endlocation": data.end_location,
                    "endlocationid": data.end_location_id,
                    "startlocation": data.start_location,
                    "startlocationid": data.start_location_id,
                    "offererrating": rating,
                    "status": "open",
                    "ETA": data.ETA,
                    "distance": data.distance,
                    "fare": fare,
                    "stops": data.stops,
                })
                    .then((docRef) => {
                        console.log("Document written with ID: ", docRef.id);

                        rideinformationDB.doc(docRef.id).update({
                            "rideid": docRef.id
                        });

                        taxiinformationDB.doc(data.taxi_qr_code).update({
                            "status": "in use"
                        });

                        return res.status(201).json({ general: "Success", ride_id: docRef.id, current_fare: fare });
                    })
                    .catch((error) => {
                        console.error("Error adding document: ", error);
                        return res.status(500).json({ general: "Something went wrong, please try again" })
                    });

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

exports.requestCarpool = (data, res) => {
    try {
        //console.log(data);
        rideinformationDB.where("endlocationid", "==", data.end_location_id).get().then(docs => {

            var potentialrides = [];

            docs.forEach(doc => {
                if (doc.data().status == "closed") { }
                else {
                    if (doc.data().offererrating < data.min_rating) { }
                    else {
                        if (doc.data().maxriders > data.max_riders) { }
                        else {
                            //console.log(doc.data().offererrating);
                            potentialrides.push(doc.data());
                        }
                    }
                }
            });

            console.log(potentialrides);
            return res.status(201).json(potentialrides);

        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    } catch (error) {
        console.log("Something went wrong, please try again", error);
        return res.status(500).json({ general: "Something went wrong, please try again" });
    }
};

exports.getCarpoolRequests = (RID, res) => {
    try {
        //console.log(data);
        var rideRef = rideinformationDB.doc(RID);

        rideRef.get()
            .then((doc) => {
                if (doc.exists) {
                    console.log("Success retrieving requester list");
                    return res.status(201).json(doc.data().requesterlist);
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

exports.getRideInfo = (RID, res) => {
    try {
        //console.log(data);
        var rideRef = rideinformationDB.doc(RID);

        rideRef.get()
            .then((doc) => {
                if (doc.exists) {
                    console.log("Success retrieving ride info");
                    console.log(doc.data());
                    return res.status(201).json(doc.data());
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
        return res.status(500).json({ general: "Something went wrong, please try again" });
    }
}

exports.finishRide = (data, res) => {
    try {
        //console.log(data);
        var rideRef = rideinformationDB.doc(data.RID);

        rideRef.get()
            .then((doc) => {
                if (doc.exists) {
                    console.log("Ride Complete");
                    var riders = doc.data().riders;
                    var indexrider = riders.indexOf(data.CUID);
                    riders.splice(indexrider, 1);

                    return res.status(201).json({ Message: "Ride Complete!", Fare: doc.data().fare, OtherRiders: riders });

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
        return res.status(500).json({ general: "Something went wrong, please try again" });
    }
}

exports.offererFinishRide = (data, res) => {
    try {
        //console.log(data);
        var rideRef = rideinformationDB.doc(data.RID);

        rideRef.get()
            .then((doc) => {
                if (doc.exists) {
                    if (data.CUID != doc.data().offerer) {
                        console.log("Not the offerer");
                        return res.status(500).json({ Message: "Not the offerer" });
                    }
                    else {
                        taxiinformationDB.doc(doc.data().taxicode).update({
                            status: "available"
                        })
                        console.log("Ride Complete");
                        var riders = doc.data().riders;
                        var indexrider = riders.indexOf(data.CUID);
                        riders.splice(indexrider, 1);
                        return res.status(201).json({ Message: "Ride Complete!", Fare: doc.data().fare, OtherRiders: riders });
                    }
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
        return res.status(500).json({ general: "Something went wrong, please try again" });
    }
}

exports.startRide = (data, res) => {
    try {
        //console.log(data);
        var rideRef = rideinformationDB.doc(data.RID);

        rideRef.get()
            .then((doc) => {
                if (doc.exists) {
                    if (data.CUID != doc.data().offerer) {
                        console.log("Not the offerer");
                        return res.status(500).json({ Message: "Not the offerer" });
                    }
                    else {
                        if (doc.data().status == "closed") {
                            console.log("Ride already started");
                            return res.status(500).json({ Message: "Ride already started" });
                        }
                        else {
                            rideRef.update({
                                status: "closed"
                            })
                                .then(() => {
                                    console.log("Ride started");
                                    return res.status(201).json({ Message: "Ride started" });
                                })
                                .catch((error) => {
                                    console.error("Error updating document: ", error);
                                    return res.status(500).json({ Message: "Error updating document" });
                                });
                        }
                    }
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
        return res.status(500).json({ general: "Something went wrong, please try again" });
    }
}

exports.requestJoinCarpool = (data, res) => {
    try {
        //console.log(data);
        var rideRef = rideinformationDB.doc(data.RID);

        rideRef.get()
            .then((doc) => {
                if (doc.exists) {
                    if (doc.data().status == "closed") {
                        console.log("Ride already started");
                        return res.status(500).json({ Message: "Ride already started" });
                    }
                    else {

                        var x = { CUID: data.CUID, pickup_locationid: data.pickup_locationid };

                        rideRef.update({
                            requesterlist: admin.firestore.FieldValue.arrayUnion(x),
                        })
                            .then(() => {
                                console.log("Requester added");
                                return res.status(201).json({ Message: "Requester added" });
                            })
                            .catch((error) => {
                                console.error("Error updating document: ", error);
                                return res.status(500).json({ Message: "Error updating document" });
                            });
                    }
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
        return res.status(500).json({ general: "Something went wrong, please try again" });
    }
}

exports.acceptCarpoolRequest = (data, res) => {
    try {
        //console.log(data);
        var rideRef = rideinformationDB.doc(data.RID);
        var new_distance, new_fare, new_ETA;
        var map;

        rideRef.get()
            .then((doc) => {
                if (doc.exists) {
                    if (doc.data().status == "closed") {
                        console.log("Ride already started");
                        return res.status(500).json({ Message: "Ride already started" });
                    }

                    else {

                        let num_riders = doc.data().riders.length;

                        if (num_riders == doc.data().max_riders) {
                            console.log("Cannot accept more riders");
                            return res.status(500).json({ Message: "Maximum riders reached" })
                        }
                        else {
                            if (data.offererCUID != doc.data().offerer) {
                                console.log("Not the offerer");
                                return res.status(500).json({ Message: "Not the offerer" });
                            }
                            else {
                                new_distance = +data.newDistance;
                                new_ETA = data.newETA;
                                new_fare = (1.80 * new_distance / (num_riders + 1)).toFixed(2);
                                for (map of doc.data().requesterlist) {
                                    if (map.CUID == data.requesterCUID) {
                                        console.log("Found the requester");
                                        break;
                                    }
                                }

                                rideRef.update({
                                    accepted_requesters: admin.firestore.FieldValue.arrayUnion(map),
                                    ETA: new_ETA,
                                    distance: new_distance,
                                    fare: new_fare,
                                    riders: admin.firestore.FieldValue.arrayUnion(map.CUID),
                                    stops: admin.firestore.FieldValue.arrayUnion(map.pickup_locationid),
                                    requesterlist: admin.firestore.FieldValue.arrayRemove(map)
                                })
                                    .then(() => {
                                        console.log("Requester accepted");
                                        return res.status(201).json({ Message: "Requester accepted", fare: new_fare });
                                    })
                                    .catch((error) => {
                                        console.error("Error updating document: ", error);
                                        return res.status(500).json({ Message: "Error updating document" });
                                    });
                                if (doc.data().maxriders == num_riders + 1) {
                                    rideRef.update({
                                        status: "closed"
                                    });
                                }
                            }
                        }
                    }
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                    return res.status(500).json({ Message: "No such document!" });
                }
            }).catch((error) => {
                console.log("Error getting accpeted:", error);
            });
    } catch (error) {
        console.log("Something went wrong, please try again", error);
        res.status(500).json({ general: "Something went wrong, please try again" });
    }
}

exports.declineCarpoolRequest = (data, res) => {
    try {
        //console.log(data);
        var rideRef = rideinformationDB.doc(data.RID);
        var map;

        rideRef.get()
            .then((doc) => {
                if (doc.exists) {
                    if (data.offererCUID != doc.data().offerer) {
                        console.log("Not the offerer");
                        return res.status(500).json({ Message: "Not the offerer" });
                    }
                    else {
                        for (map of doc.data().requesterlist) {
                            if (map.CUID == data.requesterCUID) {
                                console.log("Found the requester");
                                break;
                            }
                        }
                        rideRef.update({
                            requesterlist: admin.firestore.FieldValue.arrayRemove(map)
                        })
                            .then(() => {
                                console.log("Requester declined");
                                return res.status(201).json({ Message: "Requester declined" });
                            })
                            .catch((error) => {
                                console.error("Error updating document: ", error);
                                return res.status(500).json({ Message: "Error updating document" });
                            });
                    }

                }
                else {
                    // doc.data() will be undefined in this case
                    console.log("No such ride exists");
                    return res.status(500).json({ general: "Something went wrong, please try again" });
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });

    } catch (error) {
        console.log("Something went wrong, please try again", error);
        res.status(500).json({ general: "Something went wrong, please try again" });
    }
}
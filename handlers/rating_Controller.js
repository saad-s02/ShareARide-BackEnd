const { db } = require("../util/admin");
const { firebase } = require("../util/firebase");
const { admin } = require("../util/admin");

// this function will create a document for the user with the parameters defined
const customerinformationDB = db.collection('CustomerInformationDB');

// done
exports.rateUser = async (inputdata, res) => {
    try {
        //console.log(data);
        var docRef = customerinformationDB.doc(inputdata.CUID);
        var customer_rating, num_ratings;
        var docdata, updated_rating;
        docRef.get()
            .then((doc) => {
                if (doc.exists) {
                    //console.log("Succcess retrieving user info");
                    //console.log(doc.data());
                    customer_rating = doc.data().rating;
                    num_ratings = doc.data().num_ratings;

                    if (num_ratings == 0) {
                        updated_rating = inputdata.rating.toFixed(1);
                    } else {
                        updated_rating = ((inputdata.rating + (customer_rating*num_ratings)) / (num_ratings + 1)).toFixed(1);
                    }

                    //console.log(inputdata.rating, customer_rating, num_ratings, updated_rating);

                    db.collection("CustomerInformationDB").doc(inputdata.CUID).update({

                        "rating": updated_rating,
                        "num_ratings": num_ratings + 1
            
                    })
                        .then((docRef) => {
                            console.log("Rating updated");
                            res.status(201).json({ message: "Rating updated" });    
                        })
                        .catch((error) => {
                            console.error("Error updating the customer's rating: ", error);
                        });
                } else {
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

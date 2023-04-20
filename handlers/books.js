const { db } = require("../util/admin");

// testing api call

exports.books = async (req, res) => {
    const booksRef = db.collection('CustomerInformationDB');
    try{      

            booksRef.get().then((snapshot) => {
            const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
            console.log(data);
            return res.status(201).json(data);
        })
    } catch (error) {
        return res
        .status(500)
        .json({ general: "Something went wrong, please try again"});
    }
};
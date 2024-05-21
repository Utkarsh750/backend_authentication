const mongoose = require("mongoose");


const connectDB = async (DATABASE_URL) => {
  try {
    const DB_OPTIONS = {
      dbName: "backendauthentication",
    };
    await mongoose.connect(DATABASE_URL);
    console.log("database connected successfully");
  } catch (error) {
    console.log(error);
  }
};


module.exports = connectDB;
// const mongoose = require("mongoose");


// async function connectMongoDb(url) {
//   return mongoose.connect(url);
// }


// module.exports = {
//   connectMongoDb,
// };



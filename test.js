const mongoose = require("mongoose");

mongoose
  .connect("mongodb+srv://pydavarshitha99_db_user:varshitha@cluster0.fio4yid.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("✅ Connected!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:");
    console.error(err);
    process.exit(1);
  });
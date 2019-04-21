require("dotenv").config();
var express = require("express");
var mongoose = require("mongoose");
var app = express();
var PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoScrape";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes
require("./routes/apiRoutes")(app);
require("./routes/htmlRoutes")(app);

// app.listen(PORT, function(){
//   console.log("listening on port" + PORT);
// });
// Starting the server, syncing our models ------------------------------------/
app.listen(PORT, function() {
     console.log(
       "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
       PORT,
       PORT
     );
   });

module.exports = app;

var axios = require("axios");
var cheerio = require("cheerio");
var db = require("../models");


module.exports = function(app) {
    app.get("/api/fetch", function(req, res) {
        // First, we grab the body of the html with axios
        axios.get("https://www.nytimes.com/").then(function(response) {
          // Then, we load that into cheerio and save it to $ for a shorthand selector
          var $ = cheerio.load(response.data);
          var result=[];
          // Now, we grab every h2 within an article tag, and do the following:
          $("article h2").each(function(i, element) {  
            // Add the text and href of every link, and save them as properties of the result object
            var headline = $(this).children("span").text();
            var summary = $(this).parents("a").children("ul").text();
            var url = "https://www.nytimes.com" + $(this).parents("a").attr("href");
            if ( headline !== "" && summary !== ""){
              var newArticle = {
                  headline: headline,
                  url: url,
                  summary: summary
              };
              result.push(newArticle);
            }
          });
          // Send a message to the client
          db.Article.insertMany(result, function(error, docs){
          });
        });
        res.send("scrap completed");
      });
    
      app.get("/api/headlines", function(req, res){
        if (req.query.saved === "true") {
            db.Article.find({saved: true}, function(error, docs) {
                if (error) {
                    console.log(error.errmsg);
                };
                res.send(docs);     
            });
        }
        else {
            db.Article.find({saved: false}, function(error, docs) {
                if (error) {
                    console.log(error.errmsg);
                };
                res.send(docs);     
            });
        }
    });

    app.put("/api/headlines", function(req, res){
        db.Article.updateOne({_id: req.body.id}, {saved: true}, function(error, docs) {
            if (error) {
                console.log(error.errmsg);
            };
            console.log(docs);
        })
    });

    app.get("/api/clear", function(req,res){
        db.Article.remove({}, function(error, docs){
            if (error) {
                console.log(error.errmsg);
            }
            console.log(docs);
        });
        db.Note.remove({}, function(error, docs){
            if (error) {
                console.log(error.errmsg);
            }
            console.log(docs);
        });
        res.send("cleared");
    });

    app.get("/api/notes/:id", function(req, res){
        db.Article.findOne({_id: req.params.id}).populate("note").then(function(docs){
            res.send(docs.note)
        });   
    });

    app.post("/api/notes", function(req, res) {
        db.Note.create({body: req.body.noteText}).then(function (docs) {
            db.Article.findOneAndUpdate({_id: req.body._articleId}, {$push: {note: docs._id}}, {new: true}).then()
        });
        res.send("note saved");
    });

    app.delete("/api/notes/:id", function(req, res){
        db.Note.remove({_id: req.params.id}).then(
            res.send("note deleted")
        );   
    });

    app.delete("/api/headlines/:id", function(req, res){
        db.Article.remove({_id: req.params.id}).then(
            res.send("article deleted")
        );
    });
};
//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const MONGO_URI = "mongodb+srv://abduqayum9504:Abdukayum1995@cluster0.flzpzxw.mongodb.net/todolistDB"
mongoose.set("strictQuery", false);
const connectDB = async ()=> {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    console.log("Finally har doim ishlaydi");
  }
}
// mongoose.connect("", {useNewUrlParser: true});

// Mongoose Schema
const itemsSchema = {
  name: String,
};

// Mongoose Model
const Item = mongoose.model("Item", itemsSchema);

// Mongoose Document
const item1 = new Item ({
  name: "Welcome to your todoList!"
});
const item2 = new Item ({
  name: "Hit the + button to add a new item"
});
const item3 = new Item ({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Mongoose insertMany()
// Item.insertMany(defaultItems)
//  .then(function (defaultItems) {
//    console.log("Successfully saved all the default items to DB");
//  })
//  .catch(function (err) {
//    console.log(err);
//  });

app.get("/", function(req, res) {

  //printing all store values in terminal (In my case Hyper Terminal)
  Item.find({})
    .then(foundItem => {
      if (foundItem.length === 0) {
        return Item.insertMany(defaultItems);
        console.log("Successfully saved all the default items to DB");
      } else {
        return res.render("list", {
          listTitle: "Today",
          newListItems: foundItem
        });;
      }
    })
    .catch(err => console.log(err));
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName})
    .then(foundList => {
      if (!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName)
      } else {
        //Show an existing list

        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
         })
      }
    })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
      .then(foundList => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
      .then(function(checkedItemId) {
        res.redirect("/");
        console.log("Successfully deleted the checked item.");
      })
      .catch(function(err) {
        console.log(err);
      })
  } else {
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: checkedItemId}}}
    )
      .then(function(foundList){
        if (foundList) {
          res.redirect("/" + listName);
        }
      })
  }


});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  })
})
// if (port == null || port == "") {
//   port = 3000;
// }

// app.listen(port, function() {
//   console.log("Server started successfully");
// });

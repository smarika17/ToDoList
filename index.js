//* jshint esversion:6
require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ =require("lodash");
const app = express()
const PORT = process.env.PORT || 3030;


 
app.set("view engine", "ejs")
 
app.use(bodyParser.urlencoded({ extended: true }))
mongoose.set("strictQuery", false) //! Written to avoid the Error Message.
app.use(express.static("public"))
 
// mongoose.connect("mongodb+srv://Smarika_17:Rashmi17@cluster0.bf3uiox.mongodb.net/todolistDB", {
//     useNewUrlParser: true,
// })
const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }
 
const itemsSchema = {
    name: String,
}
 
const Item = mongoose.model("Item", itemsSchema)
 
const item1 = new Item({
    name: "Welcome to your todolist",
})
 
const item2 = new Item({
    name: "Hit the + button to aff a ne item.",
})
 
const item3 = new Item({
    name: "<-- Hit this to delete an item.",
})
 
const defaultItems = [item1, item2, item3]
 
const listSchema = {
    name: String,
    items: [itemsSchema],
}
 
const List = mongoose.model("List", listSchema)
 
app.get("/", (req, res) => {
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("Successfully saved default items to DB.")
                }
            })
            res.redirect("/")
        } else {
            res.render("list", { listTitle: "Today", newListItems: foundItems })
        }
    })
})
 
app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
 
    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems,
                })
                list.save()
                res.redirect("/" + customListName)
            } else {
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items,
                })
            }
        }
    })
 
    const list = new List({
        name: customListName,
        items: defaultItems,
    })
    list.save()
})
 
app.post("/", (req, res) => {
    let itemName = req.body.newItem
    let listName = req.body.list
 
    const item = new Item({
        name: itemName,
    })
 
    if (listName === "Today") {
        item.save()
        res.redirect("/")
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item)
            foundList.save()
            res.redirect("/" + listName)
        })
    }
})
 
app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox
    const listName = req.body.listName;

    if(listName=== "Today"){
      Item.findByIdAndRemove(checkedItemId, function (err) {
        if (!err) {
            console.log("Successfully deleted checked item.")
            res.redirect("/")
        }
    });

    }else{
      List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId.trim() } } }, function (err, foundList) {
        if (!err) { res.redirect("/" + listName) }
    })
}

    
 
    console.log(req.body.checkbox)
})
 
app.get("/about", (req, res) => {
    res.render("about")
})
 
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("server started on port ${PORT}");
      });
})
 
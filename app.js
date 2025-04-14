const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect to MongoDB
mongoose.connect("mongodb+srv://admin-amit:12345@cluster0.1xhvswt.mongodb.net/todoDb?retryWrites=true&w=majority&appName=Cluster0/toDoListDb");

const itemSchema = new mongoose.Schema({ name: String });
const listSchema = new mongoose.Schema({ name: String, items: [itemSchema] });

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

const defaultItems = [
  { name: "Welcome" },
  { name: "Add New Item" },
  { name: "Delete AN Item" }
];

app.get("/", async function(req, res) {
  try {
    const itemArray = await Item.find();
    if (itemArray.length === 0) {
      await Item.insertMany(defaultItems);
      console.log("Added default items");
      return res.redirect("/");
    }
    res.render("list", { listTitle: "Today", newListItems: itemArray });
  } catch (e) {
    console.error("Error fetching items:", e);
    res.status(500).send("Error occurred while fetching items.");
  }
});

app.post("/", async function(req, res) {
  try {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const newItem = new Item({ name: itemName });

    if (listName === "Today") {
      await newItem.save();
      res.redirect("/");
    } else {
      let foundList = await List.findOne({ name: listName });
      if (!foundList) {
        foundList = new List({ name: listName, items: [newItem] });
      } else {
        foundList.items.push(newItem);
      }
      await foundList.save();
      res.redirect("/" + listName);
    }
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/:listType", async function(req, res) {
  try {
   
    const listType=_.capitalize(req.params.listType);

    let foundList = await List.findOne({ name: listType });

    if (!foundList) {
      foundList = new List({ name: listType, items: defaultItems });
      await foundList.save();
    }
    res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).send("An error occurred while processing your request.");
  }
});

app.get("/about", function(req, res) {
  res.render("about");
});
app.post("/delete", async (req, res) => {
    try {
      const itemToRemove = req.body.checkbox;
      const listName = req.body.listName;
  
      if (listName === "Today") {
        await Item.findByIdAndDelete(itemToRemove);
        console.log(`Successfully deleted item with ID: ${itemToRemove}`);
        res.redirect("/");
      } else {
        await List.findOneAndUpdate(
          { name: listName },
          { $pull: { items: { _id: itemToRemove } } }
        );
        console.log(`Successfully deleted item with ID: ${itemToRemove} from list: ${listName}`);
        res.redirect("/" + listName);
      }
    } catch (error) {
      console.error(`Error deleting item: ${error}`);
      res.status(500).send("Error deleting item.");
    }
  });
  
// app.post("/delete", async (req, res) => {
//   try {
//     const itemToRemove = req.body.checkbox;
//     const listName=req.body.listName;
//     if(listName==="Today"){

//         await Item.findByIdAndDelete(itemToRemove);
//         console.log(`Successfully deleted item with ID: ${itemToRemove}`);
//         res.redirect("/");
//     }
//     else{
//          List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemToRemove}}});
//          res.redirect("/"+listName);

//     }
    

//   } catch (error) {
//     console.error(`Error deleting item: ${error}`);
//     res.status(500).send("Error deleting item.");
//   }
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

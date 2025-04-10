//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//mongoose thnings
mongoose.connect("mongodb://localhost:27017/toDoListDb");
const itemSchema=new mongoose.Schema({name:String});
const listSchema=new mongoose.Schema({name:String,items:[itemSchema]})
const item=mongoose.model("Item",itemSchema)
const List=mongoose.model("Lists",listSchema)
const item1=new item({name:"Welcome"});
const item2=new item({name:"Add New Item"});
const item3=new item({name:"Delete AN Item"});

const defaultItems = [item1,item2,item3];


// item.insertMany({items},function(e){
//   if(e){
//     console.log(e);
//   }
//   else{
//     console.log("added 3");
//   }
// });

// app.get("/", function(req, res) {

//   const finder=async()=>{
//     try {
//       const itemArray=await item.find();
//       if(itemArray===0){
//         item.insertMany(items)
//         .then(() => {
//           console.log("Added 3 items");
//         })
//         .catch((e) => {
//           console.log(e);
//         });
//       itemArray.forEach(i => {
//         console.log(i);
//       });
//     } catch (e) {
//       console.log(e);
//     }
  
//   }
//   finder();


//  }
//   res.render("list", {listTitle:"Today", newListItems: itemArray});

// });
app.get("/", async function(req, res) {
  try {
    const itemArray = await item.find(); // Fetch items from database

    // Check if the database is empty
    if (itemArray.length === 0) {
      await item.insertMany(defaultItems); // Insert default items
      console.log("Added 3 items");
      res.redirect("/");
    }

    // Render the view inside the `try` block after elseoperations are done
    else{res.render("list", { listTitle: "Today", newListItems: itemArray })};
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occurred while fetching items.");
  }
});

// app.post("/", async function(req, res){

//   const itemName = req.body.newItem;
//   const listName = req.body.list;
//   const newItem=new  item({name:itemName});
//   if(listName==="Today"){
//     newItem.save();
//     res.redirect("/");
//   }
//   else{
//     const found=List.findOne({ name: listName });
//    found.items.push(newItem);
//   found.save();
//   }
   

// });
app.post("/", async function(req, res) {
  try {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const newItem = new Item({ name: itemName });

    if (listName === "Today") {
      await newItem.save();
      res.redirect("/");
    } else {
      const foundList = await List.findOne({ name: listName });
      if (foundList) {
        foundList.items.push(newItem);
        await foundList.save();
        res.redirect("/" + listName);
      } else {
        // Handle the case where the list is not found
        res.status(404).send("List not found");
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// app.get("/:listType", async function(req,res){

// const listType=req.params.listType;
// const foundList= await List.findOne({name:listType});
// if (!foundList) {
//   const list = new List({ name: listType, items: defaultItems });
//   await list.save();
//   res.render("list", { listTitle: list.name, newListItems: list.items });
// } else {
//   // show existing
//   res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
// }

// });
app.get("/:listType", async function(req, res) {
  try {
      const listType = req.params.listType;
      const foundList = await List.findOne({ name: listType });
      
      if (!foundList) {
          const list = new List({ name: listType, items: defaultItems });
          await list.save();
          res.redirect("/"+listType);
      } else {
          res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
  } catch (err) {
      console.error(err);
      res.status(500).send("An error occurred while processing your request.");
  }
});


app.get("/about", function(req, res){
  res.render("about");
});


app.post("/delete",(req,res)=>{
const itemToRemove=req.body.checkbox;
item.findByIdAndDelete(itemToRemove)
  .then(() => {
    console.log(`Successfully deleted item with ID: ${itemToRemove}`);
    res.redirect("/");
  })
  .catch((error) => {
    console.log(`Error deleting item: ${error}`);
  });
})
app.listen(3000, function() {
  console.log("Server started on port 3000");
});

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const date = require(__dirname + "/date.js");
// var items = ['Buy Food','Cook Food','Eat Food'];
// var workItems = [];
const app = express();


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{ useNewUrlParser: true,useUnifiedTopology: true });

const itemsSchema = new mongoose.Schema({
    name: String 
});
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name:"Welcome to our Todo List "
});

const item2 = new Item({
    name:"Hit the button to add a new item"
});

const item3 = new Item({
    name:"<----- Hit this to delete an item "
});

const defaultItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List",listSchema);
// Item.insertMany(defaultItems,function(err){
//     if(err){
//         console.log(err);
//     }else {
//         console.log("Inserted Default Items Successfully");
//     }
// });
app.set('view engine','ejs');
console.log(date);
app.get("/:listName",function(req, res){
    const customListName = _.capitalize(req.params.listName);
    List.findOne({name: customListName},function(err,foundList){
        if(!err){
            if (!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
                //res.render("list",{listTitle: list.name, newListItems: list.items });   
                // console.log(" doesnt exist");
            }
            else{
                res.render("list",{listTitle: foundList.name, newListItems: foundList.items });   
                // console.log("exists");
            }
        }
    });
    
    // Item.find({},function(err,foundItems){
    //     if(!err){
    //         if(foundItems.length)
    //     }
    // });
    
    
    //res.render("list",{listTitle: customListName, newListItems: workItems });   
});

app.get("/",function(req, res){

    Item.find({}, function(err, foundItems){
    if(err){
        console.log(err);
     }
     else{
         if(foundItems.length === 0){
            Item.insertMany(defaultItems,function(err){
            if(err){
                 console.log(err);
            }else {
                 console.log("Inserted Default Items Successfully");
             }
            });
            res.redirect("/");
         }else{
            // console.log(foundItems)
            var day = date();
            res.render("list",{listTitle: day,newListItems: foundItems});
         }
         
     } 
    });

    
});
app.post("/",function(req, res){

    console.log(req.body);
    const itemName = req.body.newItem;
    const listName = req.body.list;
    var dayCheck = date();
    
    const item = new Item({
        name: itemName
    });
    if(listName === dayCheck){
        item.save();
    res.redirect("/");
    }else {
        List.findOne({name: listName}, function(err,foundList){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
        })
    }
    
    // if(req.body.list === "Work List"){
    //     workItems.push(item);
    //     res.redirect("/work");
    // }
    // else{
    //     items.push(item);
    //     res.redirect("/");
    // }

});
app.post("/delete",function(req, res){
    console.log(req.body);
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    var dayCheck = date();

    if(listName === dayCheck){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(err){
                console.log(err);
            }else{
                console.log("Successfully removed " + checkedItemId);
                res.redirect("/");
            }
        });
    }
    else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err, results){
            if(err){
                console.log(err);
            }else{
                res.redirect("/" + listName);
                console.log("updated");
            }
        })
    }

    
});

app.listen(3000,function(){
    console.log("Server running on port 3000");
});
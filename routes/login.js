
const express=require("express");
const router=express.Router();
router.use(express.json())
const db=require("../connect")
router.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
  
    // Query the database to check if username and password are valid
    db.query('SELECT * FROM user_details WHERE uName = ? AND password = ?', [username, password], (err, results) => {
      if (err) {
        console.error('Error executing MySQL query:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
  
      // User authenticated successfully
      return res.status(200).json({ message: 'Login successful', user: results[0] });
    });
  });

  router.get("/recommendItem/:userId",(req,res)=>{
    const userId = req.params.userId;
    db.query("SELECT * FROM items WHERE itemCat=?",[userId],(err,result)=>{
      if(err){
        res.status(401).json({error:err})
      }else{
        return res.status(200).json({result:result})
      }
    })
  })


  router.get("/recommends/:userId",(req,res)=>{
    const userId = req.params.userId;
    db.query("SELECT * from shopping_list WHERE uId=?",[userId],(err,result)=>{
        if(err){
            res.status(401).json(err);
        }else{
            // console.log(result);
            // res.status(200).json({result:result});
            const itemIds = result.map(item => item.itemId);
let maxQuantityItem = null;
let maxQuantity = 0;
let maxQuantityItemCat =null;
for (let index = 0; index < result.length; index++) {
  const currentItem = result[index];
  
  if (currentItem.itemQuantity > maxQuantity) {
    maxQuantity = currentItem.itemQuantity;
    maxQuantityItem = currentItem;
  }
}

if (maxQuantityItem) {
  db.query("SELECT itemCat FROM items WHERE itemID = ?", [maxQuantityItem.itemId], (err, result) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      maxQuantityItemCat=result;
      // console.log("This "+result+" is the cat with highest quantity");
  }
})
} else {
  // console.log('No items found in the table.');
}
db.query("SELECT * FROM items WHERE itemID IN (?)", [itemIds], (err, result) => {
  if (err) {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    const categories = result.map(item => item.itemCat);
    const categoryCounts = {};
  
    categories.forEach(category => {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
  
    let maxCategory = null;
    let maxCount = 0;
    
  
    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxCategory = category;
      }
    });
  
    if (maxCategory) {
      // console.log('Most repeated category:', maxCategory);
      // console.log('Count:', maxCount);
    } else {
      // console.log('No categories found.');
    }
    if(maxCount>maxQuantityItem.itemQuantity){
      // console.log(maxCategory+" Should be recommended");
      return res.status(200).json({result:maxCategory})
    }else{
        // console.log(maxQuantityItemCat);
        return res.status(200).json({result:maxQuantityItemCat[0].itemCat})
    }
  }
});

    }
      })

})
  module.exports=router;
const express=require("express");
const router=express.Router();
router.use(express.json())
const db=require("../connect")
router.get('/products', (req, res) => {
  const sql = 'SELECT * FROM items';

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {

        return res.status(200).json(result);
    }
  });
});
router.get("/product/:id",(req, res) => {
        const itemId = req.params.id;
        // Use parameterized query to avoid SQL injection
        const sql = 'SELECT * FROM items WHERE itemId = ?';
        db.query(sql, [itemId], (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                if (result.length === 0) {
                    res.status(404).json({ error: 'Product not found' });
                } else {
                   return res.status(200).json(result);
                }
            }
        });
});
router.post('/cart', (req, res) => {

  const { userID, itemId, itemName,itemPrice } = req.body;

  if (!userID || !itemId || !itemName ||!itemPrice) { // Corrected the condition for itemName
    return res.status(400).json({ message: 'Internal Error' });
  }

  // Query the database to check if the item is already in the cart
  db.query('SELECT * FROM shopping_list WHERE uId = ? AND itemId = ?', [userID, itemId], (err, results) => {
    if (err) {
      console.error('Error executing Operation:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) { // Item not in cart, insert it
      db.query("INSERT INTO shopping_list (uId, itemId, itemName, itemQuantity,itemPrice) VALUES (?,?, ?, ?, ?)", [userID, itemId, itemName, 1,itemPrice], (err, results) => {
        if (err) {
          console.error('Error executing Operation:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        return res.status(200).json({ message: 'Product Added Successfully' });
      });
    } else { // Item already in cart, update quantity
      db.query("UPDATE shopping_list SET itemQuantity = itemQuantity + 1 WHERE itemId = ? AND uId = ?", [itemId, userID], (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Internal server error' });
        }
        return res.status(200).json({ message: 'Product Quantity Updated Successfully' });
      });
    }
  });
});



router.get('/report/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = 'SELECT * FROM shopping_list WHERE uId = ?';
    
    db.query(sql, [userId], (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        if (result.length === 0) {
          res.status(404).json({ error: 'Product not found' });
        } else {
          const itemIds = result.map(item => item.itemId);
          // Corrected query syntax: use "?" as a placeholder for the array of item IDs
          db.query("SELECT * FROM items WHERE itemId IN (?)", [itemIds], (err, result) => {
            if (err) {
              res.status(500).json({ error: err });
            } else {
              res.status(200).json(result);
            }
          });
        }
      }
    });
  });
  


router.get('/cartItems/:userId', (req, res) => {
  const userId = req.params.userId;
  const sql = 'SELECT * FROM shopping_list WHERE uId = ?';
  
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      if (result.length === 0) {
        res.status(404).json({ error: 'Product not found' });
      } else {
        return res.status(200).json({ result: result });
    }
  }
  });
});

module.exports=router;

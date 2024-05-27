const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
dotenv.config();
const { initializeApp } = require('firebase/app');
const { collection, addDoc } = require('firebase/firestore');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
 
const app = express();
 
const serviceAccount = require("D:\\3rd Yr @nd Sem\\capstone\\campus-eats-7db76-firebase-adminsdk-2uijc-87ecb35284.json");
 
app.use(cors());
app.use(express.json());
 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  databaseURL: process.env.FIREBASE_DATABASE_URL
});
 
const db = admin.firestore();
 
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};
 
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);
 
// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage()
});
 
// Fetch user data
app.get('/api/user/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userData = userSnap.data();
    return res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
 
// Update user data
app.put('/api/user/:id', async (req, res) => {
  const userId = req.params.id;
  const { firstname, lastname, phone_number, dob, course_yr, school_id, username } = req.body;
  try {
    const userRef = db.collection('users').doc(userId);
    // Update user data in Firestore
    await userRef.update({
      firstname,
      lastname,
      phone_number,
      dob,
      course_yr,
      school_id,
      username
    });
 
    await admin.auth().updateUser(userId, {
      displayName: username
    });
 
    return res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user data:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
 
// get user role
app.get('/api/user-role/:uid', async (req, res) => {
  const userId = req.params.uid;
 
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
 
    const userData = userDoc.data();
    const accountType = userData.account_type;
    return res.status(200).json({ accountType: accountType });
  } catch (error) {
    console.error('Error getting user role:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
 
// Add new shop with image upload
app.post('/api/shop-application', upload.single('image'), async (req, res) => {
  const {
    shopName,
    shopDesc,
    shopAddress,
    googleLink,
    categories,
    uid,
    shopOpen,
    shopClose,
    GCASHName,
    GCASHNumber
  } = req.body;
 
  const file = req.file;
 
  if (!file) {
    return res.status(400).json({ error: 'Image file is required' });
  }
  if (!uid) {
    return res.status(400).json({ error: 'User ID is required' });
  }
 
  try {
    // Check if the user has already submitted a dasher or shop application
    const dasherDoc = await db.collection('dashers').doc(uid).get();
    if (dasherDoc.exists) {
      return res.status(400).json({ error: 'You have already submitted a dasher application' });
    }
 
    const shopDoc = await db.collection('shops').doc(uid).get();
    if (shopDoc.exists) {
      return res.status(400).json({ error: 'You have already submitted a shop application' });
    }
 
    // Upload image to Firebase Storage under shop/govID folder
    const fileName = `shop/images/${uid}_${shopName}.png`;
    const fileRef = ref(storage, fileName);
 
    // Upload the file
    const snapshot = await uploadBytes(fileRef, file.buffer);
    const imageURL = await getDownloadURL(snapshot.ref);
 
    // Store shop data in Firestore
    await db.collection('shops').doc(uid).set({
      shopName,
      shopDesc,
      shopAddress,
      googleLink,
      categories: JSON.parse(categories),
      shopImage: imageURL,
      status: 'pending',
      shopOpen,
      shopClose,
      GCASHName,
      GCASHNumber,
      deliveryFee: parseFloat(10),
      shopId: uid
    });
 
    return res.status(200).json({ message: 'Shop created successfully' });
  } catch (error) {
    console.error('Error creating shop:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/shop-update/:uid', upload.single('image'), async (req, res) => {
  const {
    shopName,
    shopDesc,
    shopAddress,
    googleLink,
    categories,
    shopOpen,
    shopClose,
    GCASHName,
    GCASHNumber
  } = req.body;
  const { uid } = req.params;
  const file = req.file;

  if (!uid) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const shopDoc = await db.collection('shops').doc(uid).get();
    if (!shopDoc.exists) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    let imageURL = shopDoc.data().shopImage;

    if (file) {
      const fileName = `shop/images/${uid}_${shopName}.png`;
      const fileRef = ref(storage, fileName);

      const snapshot = await uploadBytes(fileRef, file.buffer);
      imageURL = await getDownloadURL(snapshot.ref);
    }

    await db.collection('shops').doc(uid).update({
      shopName,
      shopDesc,
      shopAddress,
      googleLink,
      categories: JSON.parse(categories),
      shopImage: imageURL,
      shopOpen,
      shopClose,
      GCASHName,
      GCASHNumber,
      updatedAt: new Date()
    });

    return res.status(200).json({ message: 'Shop updated successfully' });
  } catch (error) {
    console.error('Error updating shop:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

 
// Add new dasher with image upload
app.post('/api/dasher-application', upload.single('image'), async (req, res) => {
  const {
    days,
    uid,
    availableStartTime,
    availableEndTime,
    GCASHName,
    GCASHNumber,
    displayName,
  } = req.body;
  const file = req.file;
 
  if (!file) {
    return res.status(400).json({ error: 'Image file is required' });
  }
  if (!uid) {
    return res.status(400).json({ error: 'User ID is required' });
  }
 
  try {
    // Check if the user has already submitted a dasher or shop application
    const dasherDoc = await db.collection('dashers').doc(uid).get();
    if (dasherDoc.exists) {
      return res.status(400).json({ error: 'You have already submitted a dasher application' });
    }
 
    const shopDoc = await db.collection('shops').doc(uid).get();
    if (shopDoc.exists) {
      return res.status(400).json({ error: 'You have already submitted a shop application' });
    }
 
    // Upload image to Firebase Storage under dasher/schoolID folder
    const fileName = `dasher/schoolID/${displayName}_${uid}.png`;
    const fileRef = ref(storage, fileName);
 
    // Upload the file
    const snapshot = await uploadBytes(fileRef, file.buffer);
    const imageURL = await getDownloadURL(snapshot.ref);
 
    // Store dasher data in Firestore
    await db.collection('dashers').doc(uid).set({
      daysAvailable: JSON.parse(days),
      schoolId: imageURL,
      status: 'pending',
      availableStartTime,
      availableEndTime,
      GCASHName,
      GCASHNumber,
      dasherId: uid,
    });
 
    return res.status(200).json({ message: 'Dasher created successfully' });
  } catch (error) {
    console.error('Error creating dasher:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/active-dashers', async (req, res) => {
  try {
    // Fetch active dashers from the dashers collection where status is 'active'
    const activeDashersSnapshot = await db.collection('dashers').where('status', '==', 'active').get();
    const activeDashers = activeDashersSnapshot.docs.map(doc => doc.data());
    return res.status(200).json(activeDashers);
  } catch (error) {
    console.error('Error fetching active dashers:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
 
app.get('/api/shops', async (req, res) => {
  try {
    const shopsSnapshot = await db.collection('shops').where('status', '==', 'active').get();
    const shopsData = [];
    shopsSnapshot.forEach((doc) => {
      const shop = doc.data();
      // Assuming you have an 'id' field in each shop document
      shop.status = 'active';
      shopsData.push(shop);
    });
    return res.status(200).json(shopsData);
  } catch (error) {
    console.error('Error fetching shops:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/shop/:shopId', async (req, res) => {
  const shopId = req.params.shopId;
  try {
    const shopDoc = await db.collection('shops').doc(shopId).get();
    if (!shopDoc.exists) {
      return res.status(404).json({ error: 'Shop not found' });
    }
 
    const shopData = shopDoc.data();
    return res.status(200).json(shopData);
  } catch (error) {
    console.error('Error fetching shop:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/shop-add-item', upload.single('image'), async (req, res) => {
  const {
    name,
    price,
    qty,
    desc,
    uid,
    categories
  } = req.body;

  const file = req.file;

  if (!uid) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const existingItemsSnapshot = await db.collection('items').where('name', '==', name).get();
    if (!existingItemsSnapshot.empty) {
      return res.status(400).json({ error: 'An item with this name already exists.' });
    }
    let imageURL = null;

    if (file) {
      const fileName = `shop/items/${uid}/${name}.png`;
      const fileRef = ref(storage, fileName);

      const snapshot = await uploadBytes(fileRef, file.buffer);
      imageURL = await getDownloadURL(snapshot.ref);
    }

    const itemData = {
      name,
      price: parseFloat(price),
      quantity: parseInt(qty),
      description: desc,
      shopID: uid,
      categories: JSON.parse(categories),
      imageUrl: imageURL,
      createdAt: new Date(),
    };
    const docRef = await db.collection('items').add(itemData);

    return res.status(200).json({ message: 'Item created successfully', itemId: docRef.id });
  } catch (error) {
    console.error('Error creating shop:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/shop-update-item/:itemId', upload.single('image'), async (req, res) => {
  const { itemId } = req.params;
  const { name, price, qty, desc, uid, categories } = req.body;
  const file = req.file;

  if (!uid) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const itemRef = db.collection('items').doc(itemId);
    const itemSnapshot = await itemRef.get();

    if (!itemSnapshot.exists) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    let imageURL = itemSnapshot.data().imageUrl;

    if (file) {
      const fileName = `shop/items/${uid}/${name}.png`;
      const fileRef = ref(storage, fileName);

      const snapshot = await uploadBytes(fileRef, file.buffer);
      imageURL = await getDownloadURL(snapshot.ref);
    }

    const updatedItemData = {
      name,
      price: parseFloat(price),
      quantity: parseInt(qty),
      description: desc,
      shopID: uid,
      categories: JSON.parse(categories),
      imageUrl: imageURL,
      updatedAt: new Date(),
    };

    await itemRef.update(updatedItemData);

    return res.status(200).json({ message: 'Item updated successfully', itemId: itemId });
  } catch (error) {
    console.error('Error updating item:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/shop/:shopId/items', async (req, res) => {
  const { shopId } = req.params;

  try {
    const itemsSnapshot = await db.collection('items').where('shopID', '==', shopId).get();
    if (itemsSnapshot.empty) {
      return res.status(404).json({ error: 'No items found for this shop.' });
    }

    const items = [];
    itemsSnapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching shop items:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/items/:itemId', async (req, res) => {
  const { itemId } = req.params;
  console.log(itemId);
  try {
    const itemSnapshot = await db.collection('items').doc(itemId).get();
    if (!itemSnapshot.exists) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const itemData = itemSnapshot.data();
    return res.status(200).json(itemData);
  } catch (error) {
    console.error('Error fetching item:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/add-to-cart', async (req, res) => {
  try {
    const { item, totalPrice, userQuantity, uid, shopID } = req.body;

    // Check if all required data is provided
    if (!item || !totalPrice || !userQuantity || !shopID) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    const shopSnapshot = await db.collection('shops').doc(shopID).get();
    if (!shopSnapshot.exists) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const cartSnapshot = await db.collection('carts').doc(uid).get();
    let cartData;
    let cartRef = db.collection('carts').doc(uid); // Get reference to the cart document

    if (!cartSnapshot.exists) {
      // If cart doesn't exist, create a new one
      cartData = { 
        items: [], 
        totalPrice: 0, 
        shopID: shopID
      };
      await cartRef.set(cartData); // Set the initial data for the cart
    } else {
      // If cart exists, get its data
      cartData = cartSnapshot.data();

      // Check if the shop ID of the item matches the shop ID of the cart
      if (cartData.shopID !== shopID) {
        return res.status(400).json({ error: 'Item is from a different shop' });
      }
    }

    const newItemIndex = cartData.items.findIndex(existingItem => existingItem.id === item.id);

    if (newItemIndex !== -1) {
      // If the item already exists, just update the quantity
      cartData.items[newItemIndex].quantity += userQuantity;
      cartData.items[newItemIndex].price += userQuantity * cartData.items[newItemIndex].price;
    } else {
      // If the item does not exist, add it to the items array
      const newItem = {
        id: item.id,
        name: item.name,
        unitPrice: parseFloat(item.price),
        price: parseFloat(item.price * userQuantity),
        quantity: userQuantity,
        itemQuantity: item.quantity
      };
      cartData.items.push(newItem);
    }

    cartData.totalPrice += totalPrice;

    await cartRef.update(cartData);

    return res.status(200).json({ message: 'Item added to cart successfully', cartId: uid });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/cart', async (req, res) => {
  try {
    const { uid } = req.query;

    if (!uid) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    const cartSnapshot = await db.collection('carts').doc(uid).get();

    if (!cartSnapshot.exists) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartData = cartSnapshot.data();

    return res.status(200).json(cartData);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/api/update-cart-item', async (req, res) => {
  try {
    const { uid, itemId, action } = req.body;
    if (!uid || !itemId || !action) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    const cartSnapshot = await db.collection('carts').doc(uid).get();
    if (!cartSnapshot.exists) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartData = cartSnapshot.data();

    const itemSnapshot = await db.collection('items').doc(itemId).get();
    if (!itemSnapshot.exists) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const itemData = itemSnapshot.data();

    const itemIndex = cartData.items.findIndex(item => item.id === itemId);


    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    let updatedItem = cartData.items[itemIndex];
    if (action === 'increase') {
      if (updatedItem.quantity < itemData.quantity) {
        updatedItem.quantity++;
        updatedItem.price += updatedItem.unitPrice;
      } else {
        return res.status(400).json({ error: 'Quantity limit reached' });
      }
    } else if (action === 'decrease') {
      if (updatedItem.quantity > 1) {
        updatedItem.quantity--;
        updatedItem.price -= updatedItem.unitPrice;
      } else {
        cartData.items.splice(itemIndex, 1);
      }
    } else if (action === 'remove') {
      cartData.items.splice(itemIndex, 1);
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    cartData.totalPrice = cartData.items.reduce((total, item) => total + item.price, 0);

    await db.collection('carts').doc(uid).update(cartData);
    return res.status(200).json({ message: 'Cart updated successfully', cartData });
  } catch (error) {
    console.error('Error updating cart:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/remove-cart', async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const cartRef = db.collection('carts').doc(uid);
    await cartRef.delete();
    return res.status(200).json({ message: 'Cart removed successfully' });
  } catch (error) {
    console.error('Error removing cart:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/place-order', async (req, res) => {
  try {
    const order = req.body;

    // Ensure order contains the uid
    if (!order.uid) {
      return res.status(400).json({ error: 'User ID (uid) is required' });
    }

    // Fetch orders with the same uid
    const existingOrdersSnapshot = await db.collection('orders')
      .where('uid', '==', order.uid)
      .get();

    // Check if there's an order with status that starts with "active"
    const activeOrder = existingOrdersSnapshot.docs.find(doc => doc.data().status.startsWith('active'));

    if (activeOrder) {
      console.log('Active order found:', activeOrder.id);
      return res.status(400).json({ error: 'An active order already exists for this user' });
    }

    // Add the new order to Firestore with status "waiting_for_admin"
    const docRef = await db.collection('orders').add({
      ...order,
      status: 'active_waiting_for_admin',
      createdAt: new Date()
    });

    console.log("Order placed successfully. Order ID:", docRef.id);

    return res.status(200).json({ message: 'Order placed successfully', id: docRef.id });
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/update-order-status', async (req, res) => {
  try {
    const { orderId, status } = req.body;

    // Update the status of the order in the Firestore database
    await db.collection('orders').doc(orderId).update({ status });

    return res.status(200).json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/orders/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const ordersSnapshot = await db.collection('orders').where('uid', '==', uid).get();
    
    if (ordersSnapshot.empty) {
      return res.status(404).json({ error: 'No orders found for this user' });
    }

    const orders = [];
    const activeOrders = [];

    ordersSnapshot.forEach(doc => {
      const order = doc.data();
      if (order.status.startsWith('active')) {
        activeOrders.push({ id: doc.id, ...order });
      } else {
        orders.push({ id: doc.id, ...order });
      }
    });

    return res.status(200).json({ orders, activeOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const ordersSnapshot = await db.collection('orders').get();
    
    if (ordersSnapshot.empty) {
      return res.status(404).json({ error: 'No orders found' });
    }

    const activeOrders = [];

    ordersSnapshot.forEach(doc => {
      const order = doc.data();
      if (order.status && order.status.startsWith('active_waiting_for_admin')) {
        activeOrders.push({ id: doc.id, ...order });
      }
    });

    return res.status(200).json(activeOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/completed-orders', async (req, res) => {
  try {
    const ordersSnapshot = await db.collection('orders').get();
    
    if (ordersSnapshot.empty) {
      return res.status(404).json({ error: 'No orders found' });
    }

    const completedOrders = [];

    ordersSnapshot.forEach(doc => {
      const order = doc.data();
      if (!order.status || !order.status.startsWith('active')) {
        completedOrders.push({ id: doc.id, ...order });
      }
    });

    return res.status(200).json(completedOrders);
  } catch (error) {
    console.error('Error fetching completed orders:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});






 
app.listen(5000, () => console.log('Server running on http://localhost:5000'));
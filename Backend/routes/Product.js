const express = require('express');
const router = express.Router();
const ProductsController = require('../controllers/ProductsController');
const {authMiddleware ,roleMiddleware } = require('../middleware/auth'); // تحقق من JWT

router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.post('/', ProductsController.createProduct);
router.put('/:id', ProductsController.updateProduct);
router.delete('/:id', ProductsController.deleteProduct);
router.get('/', ProductsController.listProducts);

module.exports = router;
 
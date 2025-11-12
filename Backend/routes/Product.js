const express = require('express');
const router = express.Router();
const ProductsController = require('../controllers/ProductsController');
const {authMiddleware ,roleMiddleware } = require('../middleware/auth'); 

router.use(authMiddleware);

// =================== CRUD PRODUCT  =======================================
router.post('/', roleMiddleware('admin'),ProductsController.createProduct);
router.put('/:id', roleMiddleware('admin'),ProductsController.updateProduct);
router.delete('/delete-all', roleMiddleware(['admin']), ProductsController.deleteAllProducts); 
router.delete('/:id', roleMiddleware('admin'),ProductsController.deleteProduct);

// =================== CRUD VARIANT  =========================================================
router.put('/:productId/variant/:variantId', roleMiddleware('admin'), ProductsController.updateVariant); 
router.delete('/:productId/variant/:variantId', roleMiddleware('admin'), ProductsController.deleteVariant); 

// =================== GET PRODUCT =========================================================
router.get('/search', roleMiddleware(['admin','vendor']), ProductsController.searchProducts);       //    /search?query=<search_term>
router.get('/', roleMiddleware(['admin','vendor']), ProductsController.listProducts);
 
module.exports = router;

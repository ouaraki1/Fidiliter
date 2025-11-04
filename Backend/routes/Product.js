const express = require('express');
const router = express.Router();
const ProductsController = require('../controllers/ProductsController');
const {authMiddleware ,roleMiddleware } = require('../middleware/auth'); 

router.use(authMiddleware);

router.post('/', roleMiddleware('admin'),ProductsController.createProduct);//done

router.put('/:id', roleMiddleware('admin'),ProductsController.updateProduct);//done
router.put('/:productId/variant/:variantId', roleMiddleware('admin'), ProductsController.updateVariant); //done

router.delete('/delete-all', roleMiddleware(['admin']), ProductsController.deleteAllProducts); //done
router.delete('/:id', roleMiddleware('admin'),ProductsController.deleteProduct);//done
router.delete('/:productId/variant/:variantId', roleMiddleware('admin'), ProductsController.deleteVariant); //done

router.get('/search', roleMiddleware(['admin','vendor']), ProductsController.searchProducts);    //done       /search?query=<search_term>
router.get('/', roleMiddleware(['admin','vendor']), ProductsController.listProducts);//done
module.exports = router;

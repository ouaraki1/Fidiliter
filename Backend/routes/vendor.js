const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const vendorController = require('../controllers/vendor');
const upload = require('../middleware/upload'); // Multer

router.use(authMiddleware, roleMiddleware(['vendor']));

router.post('/clients',  upload.single('img'), vendorController.createClient);// done
router.get('/clients',   vendorController.getMyClients);// done
router.put('/clients/:id',  upload.single('img'), vendorController.editClient);// done
router.patch('/clients/:id/toggle', vendorController.toggleClient);// done

module.exports = router; 
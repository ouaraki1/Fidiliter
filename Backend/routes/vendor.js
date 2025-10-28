const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const VendorController = require('../controllers/vendor');

router.use(authMiddleware, roleMiddleware(['vendor']));

router.post('/create-client', VendorController.createClient);
router.put('/edit-client/:id', VendorController.editClient);
router.put('/toggle-client/:id', VendorController.toggleClient);

module.exports = router;

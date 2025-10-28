const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const AdminController = require('../controllers/admin');

router.use(authMiddleware, roleMiddleware(['admin','superadmin']));

router.post('/create-vendore', AdminController.createVendor);// done
router.put('/edit-vendore/:id', AdminController.editVendor);// done
router.put('/toggle-vendore/:id', AdminController.toggleVendor);// done
router.get('/clients', AdminController.listClients);// done

router.get('/vendors', AdminController.listVendors);
router.get('/vendors-with-clients', AdminController.listVendorsWithClients);

router.put('/update-profile', AdminController.updateAdminProfile);



module.exports = router;

const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const AdminController = require('../controllers/admin');
const upload = require('../middleware/upload');

router.use(authMiddleware, roleMiddleware(['admin','superadmin']));
 
router.get('/stats', AdminController.getAdminStats);// done suite de test XX | plus de .....

router.post('/create-vendore', AdminController.createVendor);// done
router.put('/edit-vendore/:id', AdminController.editVendor);// done
router.put('/toggle-vendore/:id', AdminController.toggleVendor);// done
router.get('/clients', AdminController.listClients);// done
router.delete('/vendors', AdminController.deleteAllVendors);

router.get('/vendors', AdminController.listVendors); // done
router.get('/vendors-with-clients', AdminController.listVendorsWithClients);// done

router.put('/update-profile', upload.single('img'), AdminController.updateAdminProfile);// done

router.post('/tombola', AdminController.drawTombolaWinners);//done
router.get('/tombolas', AdminController.listTombolas);//problem



module.exports = router;

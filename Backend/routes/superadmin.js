const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const SuperAdminController = require('../controllers/superadmin');

router.use(authMiddleware, roleMiddleware(['superadmin']));

router.post('/create-admin', SuperAdminController.createAdmin); // done
router.put('/edit-admin/:id', SuperAdminController.editAdmin); // done
router.delete('/delete-admin/:id', SuperAdminController.deleteAdmin);// done
router.put('/disable-admin/:id', SuperAdminController.disableAdmin);// done
router.put('/enable-admin/:id', SuperAdminController.enableAdmin);// done


router.post('/create-vendor-for-admin/:adminId', SuperAdminController.createVendorForAdmin);// done
router.put('/edit-vendor/:vendorId', SuperAdminController.editVendor);// done
router.delete('/delete-vendor/:vendorId', SuperAdminController.deleteVendor);// done

router.get('/pending-vendors', SuperAdminController.listPendingVendors);// done
router.put('/approve-vendor/:vendorId', SuperAdminController.approveVendor);// done
router.put('/reject-vendor/:vendorId', SuperAdminController.rejectVendor);// done

router.get('/admins', authMiddleware, SuperAdminController.listAllAdmins);
router.get('/vendors', authMiddleware, SuperAdminController.listAllVendors);


router.put('/update-profile', authMiddleware, SuperAdminController.updateSuperAdminProfile);

module.exports = router; 

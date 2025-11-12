const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const SuperAdminController = require('../controllers/superadmin');

router.use(authMiddleware, roleMiddleware(['superadmin']));


// ================== ADMIN ===================================
router.post('/create-admin', upload.single('img'), SuperAdminController.createAdmin);  // D
router.put('/edit-admin/:id', upload.single('img'), SuperAdminController.editAdmin);  // D
router.put('/disable-admin/:id', SuperAdminController.disableAdmin);  // D
router.put('/enable-admin/:id', SuperAdminController.enableAdmin);  // D
router.get('/admins', authMiddleware, SuperAdminController.listAllAdmins);  // D
router.delete('/delete-all-admins', authMiddleware, SuperAdminController.deleteAllAdmins);
router.delete('/delete-admin/:id', SuperAdminController.deleteAdmin);  // D

// ================== VENDOR ===================================
router.post('/create-vendor-for-admin/:adminId', SuperAdminController.createVendorForAdmin);  // D
router.put('/edit-vendor/:vendorId', SuperAdminController.editVendor);  // D
router.get('/vendors', authMiddleware, SuperAdminController.listAllVendors);  // D
router.get('/vendors-by-admin/:adminId', SuperAdminController.getVendorsByAdmin); // D
router.delete('/delete-all-vendors', authMiddleware, SuperAdminController.deleteAllVendors);
router.delete('/delete-vendor/:vendorId', SuperAdminController.deleteVendor);  // D


// ================== SUPERADMIN ===================================
router.put('/update-profile', authMiddleware, SuperAdminController.updateSuperAdminProfile);  // D
router.get('/stats', SuperAdminController.getSuperAdminStats);// ATT


module.exports = router; 
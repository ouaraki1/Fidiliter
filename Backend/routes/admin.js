const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const AdminController = require('../controllers/admin');
const upload = require('../middleware/upload');

router.use(authMiddleware, roleMiddleware(['admin', 'superadmin']));

// =========== CRUD VENDOR  ===================================
router.post('/create-vendore', AdminController.createVendor);  // D
router.put('/edit-vendore/:id', AdminController.editVendor);  // D
router.put('/toggle-vendore/:id', AdminController.toggleVendor);  // D
router.delete('/vendors', AdminController.deleteAllVendors);  // ATT
router.delete('/vendors/:id', AdminController.deleteVendor);  // D

// =================== UPDATE PROFILE  ================================================
router.put('/update-profile', upload.single('img'), AdminController.updateAdminProfile);  // D
// get profile
// ================= GET DATA : CLIENT | VENDOR ...  ======================
router.get('/clients', AdminController.listClients);  // ATT
router.get('/vendors', AdminController.listVendors);  // D
router.get('/vendors-with-clients', AdminController.listVendorsWithClients);  // ATT

// ================= TOMBOLA - GET TOMBOLA =================
router.post('/tombola', AdminController.drawTombolaWinners);  // ATT
router.get('/tombolas', AdminController.listTombolas);  // ATT

// ================== CRUD UPLOAD ======================================= 
router.post('/upload', upload.single('file'), AdminController.uploadFile);  // ATT
router.put('/update/:id', upload.single('file'), AdminController.updateFile);  // ATT
router.delete('/delete/:id', AdminController.deleteFile);  // ATT

// =============== DASHBORD =========================
router.get('/stats', AdminController.getAdminStats);  // ATT


module.exports = router;

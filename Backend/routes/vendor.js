const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const vendorController = require('../controllers/vendor');
const upload = require('../middleware/upload'); 

router.use(authMiddleware, roleMiddleware(['vendor']));

// ================== CRUD CLIENT ===================================
router.post('/clients', upload.single('img'), vendorController.createClient);
router.put('/clients/:id', upload.single('img'), vendorController.editClient);
router.patch('/clients/:id/toggle', vendorController.toggleClient);
router.delete('/clients/:id', vendorController.deleteClient); 


// ================== POINT ===================================
router.post('/ajouter-points', vendorController.ajouterPointsClient);
router.post('/donner-cadeau', vendorController.donnerCadeauClient);


// ============= GET DATA : CLIENT | HISTORIQUE =============
router.get('/historique', vendorController.getHistorique);
router.get('/allclients', vendorController.getALLClients);
router.get('/clients/search', vendorController.searchClients);   //   /search?query=<search_term>
router.get('/clients', vendorController.getMyClients);
router.get('/clients/:id',  vendorController.getClientDetails);


// ================== DASHBORD ===================================
router.get('/stats', vendorController.getVendeurStats);

module.exports = router;
const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const vendorController = require('../controllers/vendor');
const upload = require('../middleware/upload'); // Multer

router.use(authMiddleware, roleMiddleware(['vendor']));

router.post('/clients', upload.single('img'), vendorController.createClient);// done
router.post('/ajouter-points', vendorController.ajouterPointsClient);//done
router.post('/donner-cadeau', vendorController.donnerCadeauClient);//done


router.put('/clients/:id', upload.single('img'), vendorController.editClient);//done

router.patch('/clients/:id/toggle', vendorController.toggleClient);//done
router.delete('/clients/:id', vendorController.deleteClient);//done


router.get('/clients/search', vendorController.searchClients);//done
router.get('/allclients', vendorController.getALLClients);//done
router.get('/clients', vendorController.getMyClients);//done
router.get('/stats', vendorController.getVendeurStats);// plus de .....
router.get('/historique', vendorController.getHistorique);//done
router.get('/clients/:id',  vendorController.getClientDetails);//done



module.exports = router;
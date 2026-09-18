const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');

// Master data (Departments, Role Types, Roles)
router.get('/master-data', controller.getUserMasterData);

// User List (supports ?status=active and ?status=deactive and ?search=...)
router.get('/', controller.getAllUsers);
router.get('/:id', controller.getUserById);

// Create and Update User
router.post('/', controller.createUser);
router.put('/:id', controller.updateUser);

// Lifecycle actions matching PHP UserController
router.post('/:id/deactivate', controller.deactivateUser);
router.post('/:id/activate', controller.activateUser);
router.post('/:id/clear-device', controller.clearUserDeviceId);
router.delete('/:id', controller.deleteUserPermanent);

module.exports = router;
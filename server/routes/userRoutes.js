const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Master data (Departments, Role Types, Roles)
router.get('/master-data', controller.getUserMasterData);

// User List (supports ?status=active and ?status=deactive and ?search=...)
router.get('/', controller.getAllUsers);
router.get('/:id', controller.getUserById);

// Create and Update User
router.post('/', protect, authorizeRoles('admin', 'management', 'hr'), controller.createUser);
router.put('/:id', protect, authorizeRoles('admin', 'management', 'hr'), controller.updateUser);

// Lifecycle actions matching PHP UserController
router.post('/:id/deactivate', protect, authorizeRoles('admin', 'management', 'hr'), controller.deactivateUser);
router.post('/:id/activate', protect, authorizeRoles('admin', 'management', 'hr'), controller.activateUser);
router.post('/:id/clear-device', protect, authorizeRoles('admin', 'management', 'hr'), controller.clearUserDeviceId);
router.delete('/:id', protect, authorizeRoles('admin', 'management'), controller.deleteUserPermanent);

module.exports = router;
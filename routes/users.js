const auth = require('../middlewares/auth'),
  router = require('express').Router();

const userController = require('../controllers/user');

router.post('/', userController.createUser)
router.get('/:id', auth.required, userController.getUser);
router.get('/:id/profile', userController.getUserProfile);
router.put('/:id', auth.required, userController.updateUser)
router.patch('/:id/password', auth.required, userController.updateUserPassword)
router.post('/:id/profile', auth.required, userController.updateUserProfile)
router.delete('/:id', auth.required, userController.deleteUser)
router.post('/login', userController.loginUser)

module.exports = router;

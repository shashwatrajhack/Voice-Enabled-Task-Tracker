const express = require('express');
const router = express.Router();
const controller = require('../controllers/taskController');
const { body, param } = require('express-validator');

const validateTaskFields = [
  body('title').optional().isString().notEmpty().withMessage('Title is required'),
  body('status').optional().isIn(['To Do','In Progress','Done']),
  body('priority').optional().isIn(['Low','Medium','High','Critical']),
];

router.get('/', controller.getAllTasks);
router.post('/', [
  body('title').exists().withMessage('Title is required').isString()
], controller.createTask);
router.get('/:id', controller.getTask);
router.put('/:id', validateTaskFields, controller.updateTask);
router.delete('/:id', controller.deleteTask);

module.exports = router;

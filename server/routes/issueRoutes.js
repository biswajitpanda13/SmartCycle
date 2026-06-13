const express = require('express');
const router = express.Router();
const { reportIssue, getIssues, resolveIssue } = require('../controllers/issueController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, reportIssue)
  .get(protect, admin, getIssues);

router.route('/:id/resolve')
  .put(protect, admin, resolveIssue);

module.exports = router;

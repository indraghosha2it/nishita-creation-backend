// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin, optionalProtect } = require('../middleware/authMiddleware');
const {
  getPublicCourses,
  getPublicCourseById,
  registerForCourse,
  getAdminCourses,
  getAdminCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  confirmRegistration,
  cancelRegistration,
  manualRegister,
  updateRegistrationStatus,
  getRegistrationById,
  deleteRegistration,
  getUserCourseRegistrations
} = require('../controllers/courseController');

// ============================================================
// PUBLIC ROUTES
// ============================================================
router.get('/', getPublicCourses);
router.get('/:id', getPublicCourseById);
router.post('/:courseId/register', optionalProtect, registerForCourse);

router.get('/user/my-registrations', protect, getUserCourseRegistrations);

// ============================================================
// ADMIN ROUTES (Protected)
// ============================================================
router.get('/admin/all', protect, isModeratorOrAdmin, getAdminCourses);
router.get('/admin/:id', protect, isModeratorOrAdmin, getAdminCourseById);
router.post('/admin', protect, isModeratorOrAdmin, createCourse);
router.put('/admin/:id', protect, isModeratorOrAdmin, updateCourse);
router.delete('/admin/:id', protect, isModeratorOrAdmin, deleteCourse);

// Registration management
router.get('/admin/registration/:registrationId', protect, isModeratorOrAdmin, getRegistrationById);
router.put('/admin/registration/:registrationId', protect, isModeratorOrAdmin, updateRegistrationStatus);
router.delete('/admin/registration/:registrationId', protect, isModeratorOrAdmin, deleteRegistration);
router.post('/admin/:courseId/manual-register', protect, isModeratorOrAdmin, manualRegister);
router.post('/admin/registration/:registrationId/confirm', protect, isModeratorOrAdmin, confirmRegistration);
router.post('/admin/registration/:registrationId/cancel', protect, isModeratorOrAdmin, cancelRegistration);

module.exports = router;
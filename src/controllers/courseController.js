// controllers/courseController.js
const Course = require('../models/Course');
const CourseRegistration = require('../models/CourseRegistration');
const User = require('../models/User');

// ============================================================
// HELPER: Generate registration stats
// ============================================================
const getCourseWithStats = async (courseId) => {
  const course = await Course.findById(courseId).lean();
  if (!course) return null;

  const stats = await CourseRegistration.aggregate([
    { $match: { courseId: course._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const statusCounts = {
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0
  };

  stats.forEach(stat => {
    statusCounts[stat._id] = stat.count;
  });

  return {
    ...course,
    stats: {
      ...statusCounts,
      total: Object.values(statusCounts).reduce((a, b) => a + b, 0)
    }
  };
};

// ============================================================
// PUBLIC: Get all active courses
// ============================================================
const getPublicCourses = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, status } = req.query;
    
    const query = { isActive: true };

    // Filter by registration status
    if (status === 'open') {
      query.registrationDeadline = { $gte: new Date() };
    } else if (status === 'closed') {
      query.registrationDeadline = { $lt: new Date() };
    } else if (status === 'upcoming') {
      query.startDate = { $gt: new Date() };
    } else if (status === 'ongoing') {
      query.startDate = { $lte: new Date() };
      query.endDate = { $gte: new Date() };
    }

    // Search by name
    if (search) {
      query.courseName = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [courses, total] = await Promise.all([
      Course.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Course.countDocuments(query)
    ]);

    // Get registration counts for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const confirmedCount = await CourseRegistration.countDocuments({
          courseId: course._id,
          status: { $in: ['confirmed', 'completed'] }
        });

        const now = new Date();
        const isBeforeDeadline = now <= new Date(course.registrationDeadline);
        const hasSpace = course.maxRegistrations === null || confirmedCount < course.maxRegistrations;

        return {
          ...course,
          confirmedRegistrations: confirmedCount,
          isRegistrationOpen: isBeforeDeadline && hasSpace && course.isActive,
          availableSpots: course.maxRegistrations === null 
            ? 'Unlimited' 
            : Math.max(0, course.maxRegistrations - confirmedCount)
        };
      })
    );

    res.json({
      success: true,
      data: coursesWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get public courses error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching courses'
    });
  }
};

// ============================================================
// PUBLIC: Get single course by ID
// ============================================================
const getPublicCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findOne({ _id: id, isActive: true }).lean();
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Get registration stats
    const stats = await CourseRegistration.aggregate([
      { $match: { courseId: course._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0
    };

    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    const confirmedCount = statusCounts.confirmed + statusCounts.completed;
    const now = new Date();
    const isBeforeDeadline = now <= new Date(course.registrationDeadline);
    const hasSpace = course.maxRegistrations === null || confirmedCount < course.maxRegistrations;

    res.json({
      success: true,
      data: {
        ...course,
        stats: statusCounts,
        confirmedRegistrations: confirmedCount,
        isRegistrationOpen: isBeforeDeadline && hasSpace && course.isActive,
        availableSpots: course.maxRegistrations === null 
          ? 'Unlimited' 
          : Math.max(0, course.maxRegistrations - confirmedCount)
      }
    });
  } catch (error) {
    console.error('Get public course error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching course'
    });
  }
};

// ============================================================
// PUBLIC: Register for a course
// ============================================================
const registerForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      fullName,
      phone,
      email,
      address,
      facebookId,
      whatsappNumber
    } = req.body;

    // Validate required fields
    if (!fullName?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Full name is required'
      });
    }

    if (!phone?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    if (!address?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Address is required'
      });
    }

    // Check if course exists and is active
    const course = await Course.findOne({ _id: courseId, isActive: true });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check registration deadline
    if (new Date() > new Date(course.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        error: 'Registration deadline has passed'
      });
    }

    // Check max registrations
    if (course.maxRegistrations !== null) {
      const confirmedCount = await CourseRegistration.countDocuments({
        courseId: course._id,
        status: { $in: ['confirmed', 'completed'] }
      });

      if (confirmedCount >= course.maxRegistrations) {
        return res.status(400).json({
          success: false,
          error: 'Course is full. No more registrations available.'
        });
      }
    }

    // Check for duplicate registration (same phone for same course)
    const existingRegistration = await CourseRegistration.findOne({
      courseId: course._id,
      phone: phone.trim()
    });

    if (existingRegistration) {
      if (existingRegistration.status === 'cancelled') {
        // Allow re-registration if previously cancelled
        existingRegistration.status = 'pending';
        existingRegistration.fullName = fullName.trim();
        existingRegistration.email = email?.trim() || '';
        existingRegistration.address = address.trim();
        existingRegistration.facebookId = facebookId?.trim() || '';
        existingRegistration.whatsappNumber = whatsappNumber?.trim() || '';
        existingRegistration.registrationSource = 'website';
        await existingRegistration.save();

        return res.json({
          success: true,
          message: 'Registration submitted successfully! Please wait for confirmation.',
          data: {
            registrationId: existingRegistration._id,
            status: existingRegistration.status
          }
        });
      }

      return res.status(400).json({
        success: false,
        error: 'You have already registered for this course with this phone number'
      });
    }

    // Get user if logged in
    let userId = null;
    let isAuthorizedUser = false;

    if (req.user) {
      userId = req.user._id;
      isAuthorizedUser = ['super_admin', 'admin', 'moderator', 'call_center_agent'].includes(req.user.role);
    }

    // Get client device info
    const clientDeviceInfo = req.body.clientDeviceInfo || {};

    // Create registration
    const registration = await CourseRegistration.create({
      courseId: course._id,
      userId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email?.trim() || '',
      address: address.trim(),
      facebookId: facebookId?.trim() || '',
      whatsappNumber: whatsappNumber?.trim() || '',
      // Authorized users get auto-confirmed
      status: isAuthorizedUser ? 'confirmed' : 'pending',
      confirmedBy: isAuthorizedUser ? userId : null,
      confirmedAt: isAuthorizedUser ? new Date() : null,
      registrationSource: 'website',
      clientDeviceInfo
    });

    // Update course registration count if confirmed
    if (isAuthorizedUser) {
      await Course.findByIdAndUpdate(course._id, {
        $inc: { currentRegistrations: 1 }
      });
    }

    res.status(201).json({
      success: true,
      message: isAuthorizedUser 
        ? 'Registration confirmed successfully!' 
        : 'Registration submitted successfully! Please wait for admin confirmation.',
      data: {
        registrationId: registration._id,
        status: registration.status,
        isAutoConfirmed: isAuthorizedUser
      }
    });
  } catch (error) {
    console.error('Register for course error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'You have already registered for this course with this phone number'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Server error while registering'
    });
  }
};

// ============================================================
// ADMIN: Get all courses (including inactive)
// ============================================================
const getAdminCourses = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;
    
    const query = {};

    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.courseName = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('createdBy', 'contactPerson email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Course.countDocuments(query)
    ]);

    // Get registration stats for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const stats = await CourseRegistration.aggregate([
          { $match: { courseId: course._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        const statusCounts = {
          pending: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0
        };

        stats.forEach(stat => {
          statusCounts[stat._id] = stat.count;
        });

        return {
          ...course,
          stats: {
            ...statusCounts,
            total: Object.values(statusCounts).reduce((a, b) => a + b, 0)
          }
        };
      })
    );

    res.json({
      success: true,
      data: coursesWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get admin courses error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching courses'
    });
  }
};

// ============================================================
// ADMIN: Get single course with registrations
// ============================================================
const getAdminCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, status, search } = req.query;

    const course = await Course.findById(id)
      .populate('createdBy', 'contactPerson email')
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Build query for registrations
    const regQuery = { courseId: course._id };

    if (status && status !== 'all') {
      regQuery.status = status;
    }

    if (search) {
      regQuery.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [registrations, totalRegistrations] = await Promise.all([
      CourseRegistration.find(regQuery)
        .populate('userId', 'contactPerson email phone')
        .populate('confirmedBy', 'contactPerson email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      CourseRegistration.countDocuments(regQuery)
    ]);

    // Get all stats
    const allStats = await CourseRegistration.aggregate([
      { $match: { courseId: course._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0
    };

    allStats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        course: {
          ...course,
          stats: {
            ...statusCounts,
            total: Object.values(statusCounts).reduce((a, b) => a + b, 0)
          }
        },
        registrations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRegistrations / parseInt(limit)),
          totalItems: totalRegistrations,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get admin course error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching course'
    });
  }
};

// controllers/courseController.js - Updated create and update methods

// ============================================================
// ADMIN: Create course
// ============================================================
const createCourse = async (req, res) => {
  try {
    const {
      courseName,
      courseDetails,
      contactNumber,
      startDate,
      endDate,
      classTime,
      totalClasses,
      courseFee,
      registrationDeadline,
      maxRegistrations,
      image,
      isActive
    } = req.body;

    // Validate required fields
    if (!courseName?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Course name is required'
      });
    }

    if (!courseDetails?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Course details are required'
      });
    }

    if (!contactNumber?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Contact number is required'
      });
    }

    if (!startDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date is required'
      });
    }

    if (!endDate) {
      return res.status(400).json({
        success: false,
        error: 'End date is required'
      });
    }

    if (!classTime?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Class time is required'
      });
    }

    if (!totalClasses || totalClasses < 1) {
      return res.status(400).json({
        success: false,
        error: 'Total classes must be at least 1'
      });
    }

    if (courseFee === undefined || courseFee < 0) {
      return res.status(400).json({
        success: false,
        error: 'Course fee is required and cannot be negative'
      });
    }

    if (!registrationDeadline) {
      return res.status(400).json({
        success: false,
        error: 'Registration deadline is required'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const deadline = new Date(registrationDeadline);

    if (end < start) {
      return res.status(400).json({
        success: false,
        error: 'End date must be after start date'
      });
    }

    if (deadline > start) {
      return res.status(400).json({
        success: false,
        error: 'Registration deadline must be before or on the start date'
      });
    }

    const course = await Course.create({
      courseName: courseName.trim(),
      courseDetails: courseDetails.trim(),
      contactNumber: contactNumber.trim(),
      startDate: start,
      endDate: end,
      classTime: classTime.trim(),
      totalClasses: parseInt(totalClasses),
      courseFee: parseFloat(courseFee),
      registrationDeadline: deadline,
      maxRegistrations: maxRegistrations ? parseInt(maxRegistrations) : null,
      image: image || '',
      isActive: isActive !== false,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while creating course'
    });
  }
};

// ============================================================
// ADMIN: Update course
// ============================================================
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      courseName,
      courseDetails,
      contactNumber,
      startDate,
      endDate,
      classTime,
      totalClasses,
      courseFee,
      registrationDeadline,
      maxRegistrations,
      image,
      isActive
    } = req.body;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Validate dates if provided
    const start = startDate ? new Date(startDate) : course.startDate;
    const end = endDate ? new Date(endDate) : course.endDate;
    const deadline = registrationDeadline ? new Date(registrationDeadline) : course.registrationDeadline;

    if (end < start) {
      return res.status(400).json({
        success: false,
        error: 'End date must be after start date'
      });
    }

    if (deadline > start) {
      return res.status(400).json({
        success: false,
        error: 'Registration deadline must be before or on the start date'
      });
    }

    // Update fields
    if (courseName) course.courseName = courseName.trim();
    if (courseDetails) course.courseDetails = courseDetails.trim();
    if (contactNumber) course.contactNumber = contactNumber.trim();
    if (startDate) course.startDate = start;
    if (endDate) course.endDate = end;
    if (classTime) course.classTime = classTime.trim();
    if (totalClasses) course.totalClasses = parseInt(totalClasses);
    if (courseFee !== undefined) course.courseFee = parseFloat(courseFee);
    if (registrationDeadline) course.registrationDeadline = deadline;
    if (maxRegistrations !== undefined) {
      course.maxRegistrations = maxRegistrations ? parseInt(maxRegistrations) : null;
    }
    if (image !== undefined) course.image = image;
    if (isActive !== undefined) course.isActive = isActive;

    course.updatedBy = req.user._id;
    await course.save();

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating course'
    });
  }
};

// ============================================================
// ADMIN: Delete course
// ============================================================
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if there are confirmed registrations
    const confirmedCount = await CourseRegistration.countDocuments({
      courseId: id,
      status: { $in: ['confirmed', 'completed'] }
    });

    if (confirmedCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete course with ${confirmedCount} confirmed registrations. Deactivate it instead.`
      });
    }

    // Delete all pending/cancelled registrations
    await CourseRegistration.deleteMany({
      courseId: id,
      status: { $in: ['pending', 'cancelled'] }
    });

    await Course.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while deleting course'
    });
  }
};

// ============================================================
// ADMIN: Confirm registration
// ============================================================
const confirmRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await CourseRegistration.findById(registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    if (registration.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        error: 'Registration is already confirmed'
      });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Cannot confirm a cancelled registration. Please re-register.'
      });
    }

    // Check max registrations
    const course = await Course.findById(registration.courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    if (course.maxRegistrations !== null) {
      const confirmedCount = await CourseRegistration.countDocuments({
        courseId: course._id,
        status: { $in: ['confirmed', 'completed'] }
      });

      if (confirmedCount >= course.maxRegistrations) {
        return res.status(400).json({
          success: false,
          error: 'Course is full. Cannot confirm more registrations.'
        });
      }
    }

    registration.status = 'confirmed';
    registration.confirmedBy = req.user._id;
    registration.confirmedAt = new Date();
    await registration.save();

    // Update course registration count
    await Course.findByIdAndUpdate(course._id, {
      $inc: { currentRegistrations: 1 }
    });

    res.json({
      success: true,
      message: 'Registration confirmed successfully',
      data: registration
    });
  } catch (error) {
    console.error('Confirm registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while confirming registration'
    });
  }
};

// ============================================================
// ADMIN: Cancel registration
// ============================================================
const cancelRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { reason } = req.body;

    const registration = await CourseRegistration.findById(registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Registration is already cancelled'
      });
    }

    const wasConfirmed = registration.status === 'confirmed' || registration.status === 'completed';

    registration.status = 'cancelled';
    if (reason) {
      registration.adminNotes = reason;
    }
    await registration.save();

    // Update course registration count if it was confirmed
    if (wasConfirmed) {
      await Course.findByIdAndUpdate(registration.courseId, {
        $inc: { currentRegistrations: -1 }
      });
    }

    res.json({
      success: true,
      message: 'Registration cancelled successfully',
      data: registration
    });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while cancelling registration'
    });
  }
};

// ============================================================
// ADMIN: Manually register a user
// ============================================================
const manualRegister = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      fullName,
      phone,
      email,
      address,
      facebookId,
      whatsappNumber,
      status = 'confirmed', // Admin manual registrations default to confirmed
      paymentStatus = 'unpaid',
      paymentAmount = 0,
      paymentMethod = '',
      paymentNote = '',
      adminNotes = ''
    } = req.body;

    // Validate required fields
    if (!fullName?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Full name is required'
      });
    }

    if (!phone?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    if (!address?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Address is required'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check for duplicate
    const existingRegistration = await CourseRegistration.findOne({
      courseId: course._id,
      phone: phone.trim()
    });

    if (existingRegistration) {
      if (existingRegistration.status === 'cancelled') {
        // Reactivate
        existingRegistration.status = status;
        existingRegistration.fullName = fullName.trim();
        existingRegistration.email = email?.trim() || '';
        existingRegistration.address = address.trim();
        existingRegistration.facebookId = facebookId?.trim() || '';
        existingRegistration.whatsappNumber = whatsappNumber?.trim() || '';
        existingRegistration.registrationSource = 'admin';
        existingRegistration.paymentStatus = paymentStatus;
        existingRegistration.paymentAmount = parseFloat(paymentAmount) || 0;
        existingRegistration.paymentMethod = paymentMethod;
        existingRegistration.paymentNote = paymentNote;
        existingRegistration.adminNotes = adminNotes;
        existingRegistration.confirmedBy = req.user._id;
        existingRegistration.confirmedAt = new Date();
        await existingRegistration.save();

        if (status === 'confirmed') {
          await Course.findByIdAndUpdate(course._id, {
            $inc: { currentRegistrations: 1 }
          });
        }

        return res.json({
          success: true,
          message: 'Registration reactivated successfully',
          data: existingRegistration
        });
      }

      return res.status(400).json({
        success: false,
        error: 'A registration with this phone number already exists for this course'
      });
    }

    // Check max registrations for confirmed status
    if (status === 'confirmed' && course.maxRegistrations !== null) {
      const confirmedCount = await CourseRegistration.countDocuments({
        courseId: course._id,
        status: { $in: ['confirmed', 'completed'] }
      });

      if (confirmedCount >= course.maxRegistrations) {
        return res.status(400).json({
          success: false,
          error: 'Course is full. Cannot add more confirmed registrations.'
        });
      }
    }

    const registration = await CourseRegistration.create({
      courseId: course._id,
      userId: null,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email?.trim() || '',
      address: address.trim(),
      facebookId: facebookId?.trim() || '',
      whatsappNumber: whatsappNumber?.trim() || '',
      status,
      confirmedBy: status === 'confirmed' ? req.user._id : null,
      confirmedAt: status === 'confirmed' ? new Date() : null,
      registrationSource: 'admin',
      paymentStatus,
      paymentAmount: parseFloat(paymentAmount) || 0,
      paymentMethod,
      paymentNote,
      adminNotes
    });

    if (status === 'confirmed') {
      await Course.findByIdAndUpdate(course._id, {
        $inc: { currentRegistrations: 1 }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration added successfully',
      data: registration
    });
  } catch (error) {
    console.error('Manual register error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A registration with this phone number already exists for this course'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Server error while registering'
    });
  }
};

// ============================================================
// ADMIN: Update registration status
// ============================================================
const updateRegistrationStatus = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { status, adminNotes, paymentStatus, paymentAmount, paymentMethod, paymentNote } = req.body;

    const registration = await CourseRegistration.findById(registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    const previousStatus = registration.status;
    const wasConfirmed = previousStatus === 'confirmed' || previousStatus === 'completed';
    const willBeConfirmed = status === 'confirmed' || status === 'completed';

    // If changing to confirmed, check max registrations
    if (willBeConfirmed && !wasConfirmed) {
      const course = await Course.findById(registration.courseId);
      
      if (course && course.maxRegistrations !== null) {
        const confirmedCount = await CourseRegistration.countDocuments({
          courseId: course._id,
          status: { $in: ['confirmed', 'completed'] }
        });

        if (confirmedCount >= course.maxRegistrations) {
          return res.status(400).json({
            success: false,
            error: 'Course is full. Cannot confirm more registrations.'
          });
        }
      }
    }

    // Update status
    if (status) {
      registration.status = status;
      
      if (willBeConfirmed && !wasConfirmed) {
        registration.confirmedBy = req.user._id;
        registration.confirmedAt = new Date();
        await Course.findByIdAndUpdate(registration.courseId, {
          $inc: { currentRegistrations: 1 }
        });
      } else if (!willBeConfirmed && wasConfirmed) {
        await Course.findByIdAndUpdate(registration.courseId, {
          $inc: { currentRegistrations: -1 }
        });
      }
    }

    if (adminNotes !== undefined) registration.adminNotes = adminNotes;
    if (paymentStatus) registration.paymentStatus = paymentStatus;
    if (paymentAmount !== undefined) registration.paymentAmount = parseFloat(paymentAmount) || 0;
    if (paymentMethod !== undefined) registration.paymentMethod = paymentMethod;
    if (paymentNote !== undefined) registration.paymentNote = paymentNote;

    await registration.save();

    res.json({
      success: true,
      message: 'Registration updated successfully',
      data: registration
    });
  } catch (error) {
    console.error('Update registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating registration'
    });
  }
};

// ============================================================
// ADMIN: Get registration by ID
// ============================================================
const getRegistrationById = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await CourseRegistration.findById(registrationId)
      .populate('courseId', 'courseName courseFee startDate endDate')
      .populate('userId', 'contactPerson email phone')
      .populate('confirmedBy', 'contactPerson email')
      .lean();

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    res.json({
      success: true,
      data: registration
    });
  } catch (error) {
    console.error('Get registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching registration'
    });
  }
};

// ============================================================
// ADMIN: Delete registration
// ============================================================
const deleteRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await CourseRegistration.findById(registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    const wasConfirmed = registration.status === 'confirmed' || registration.status === 'completed';

    if (wasConfirmed) {
      await Course.findByIdAndUpdate(registration.courseId, {
        $inc: { currentRegistrations: -1 }
      });
    }

    await CourseRegistration.findByIdAndDelete(registrationId);

    res.json({
      success: true,
      message: 'Registration deleted successfully'
    });
  } catch (error) {
    console.error('Delete registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while deleting registration'
    });
  }
};
// ============================================================
// PUBLIC: Get user's registration status for courses
// ============================================================
const getUserCourseRegistrations = async (req, res) => {
  try {
    // This route requires authentication
    if (!req.user) {
      return res.json({
        success: true,
        data: {}
      });
    }

    const { courseIds } = req.query;
    
    let query = { userId: req.user._id };

    // If specific course IDs provided, filter by them
    if (courseIds) {
      const ids = courseIds.split(',').filter(Boolean);
      if (ids.length > 0) {
        query.courseId = { $in: ids };
      }
    }

    const registrations = await CourseRegistration.find(query)
      .select('courseId status createdAt confirmedAt registrationSource')
      .lean();

    // Build a map: courseId -> registration info
    const registrationMap = {};
    registrations.forEach(reg => {
      const courseIdStr = reg.courseId.toString();
      // Keep the latest registration per course (in case of re-registration)
      if (!registrationMap[courseIdStr] || 
          new Date(reg.createdAt) > new Date(registrationMap[courseIdStr].createdAt)) {
        registrationMap[courseIdStr] = {
          registrationId: reg._id,
          status: reg.status,
          createdAt: reg.createdAt,
          confirmedAt: reg.confirmedAt,
          registrationSource: reg.registrationSource
        };
      }
    });

    res.json({
      success: true,
      data: registrationMap
    });
  } catch (error) {
    console.error('Get user course registrations error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching registrations'
    });
  }
};

module.exports = {
  // Public
  getPublicCourses,
  getPublicCourseById,
  registerForCourse,
  // Admin
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
};
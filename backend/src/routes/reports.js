const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/reports/doctor-stats
// Optimized aggregate reporting for admin/receptionists dashboard
// FIXED: Eliminated N+1 database queries by using include and count.
router.get('/doctor-stats', authenticate, async (req, res) => {
  try {
    const start = Date.now();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch all doctors with their appointment counts and today's queue tokens
    const doctors = await prisma.doctor.findMany({
      include: {
        appointments: {
          select: { status: true },
        },
        _count: {
          select: {
            queueTokens: {
              where: {
                createdAt: { gte: today },
              },
            },
          },
        },
      },
    });

    const reportData = doctors.map((doc) => {
      const totalAppointments = doc.appointments.length;
      const completedAppointments = doc.appointments.filter(a => a.status === 'COMPLETED').length;
      const cancelledAppointments = doc.appointments.filter(a => a.status === 'CANCELLED').length;
      const revenue = completedAppointments * doc.consultationFee;

      return {
        id: doc.id,
        name: doc.name,
        specialization: doc.specialization,
        department: doc.department,
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        todayQueueSize: doc._count.queueTokens,
        revenue,
      };
    });

    const durationMs = Date.now() - start;

    res.json({
      success: true,
      timeTakenMs: durationMs,
      data: reportData,
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;

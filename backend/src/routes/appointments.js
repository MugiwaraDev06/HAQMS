const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/appointments
// List all appointments
// FIXED: Eliminated N+1 Query Issue by using Prisma's include.
router.get('/', authenticate, async (req, res) => {
  try {
    const { doctorId, status } = req.query;

    const where = {};
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            age: true,
            medicalHistory: true,
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
          }
        }
      },
      orderBy: { appointmentDate: 'asc' },
    });

    res.json({
      success: true,
      count: appointments.length,
      appointments: appointments,
    });
  } catch (error) {
    console.error('Fetch appointments error:', error);
    res.status(500).json({ error: 'Failed to retrieve appointments' });
  }
});

// POST /api/appointments
// Book an appointment
// FIXED: Double booking is now structurally blocked by database unique constraint.
// Added a more robust validation check here.
router.post('/', authenticate, async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, reason } = req.body;

    if (!patientId || !doctorId || !appointmentDate) {
      return res.status(400).json({ error: 'Patient, Doctor, and Appointment Date are required.' });
    }

    const appDate = new Date(appointmentDate);

    // Robust check for existing booking at the same time
    const existingBooking = await prisma.appointment.findUnique({
      where: {
        doctorId_appointmentDate: {
          doctorId,
          appointmentDate: appDate,
        }
      },
    });

    if (existingBooking && existingBooking.status !== 'CANCELLED') {
      return res.status(400).json({
        error: 'Double booking blocked. This physician is already scheduled for another consultation at this time.',
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        appointmentDate: appDate,
        reason: reason || '',
        status: 'PENDING',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment,
    });
  } catch (error) {
    console.error('Booking error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Double booking detected. This time slot is already taken.' });
    }
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// PATCH /api/appointments/:id
// Update appointment status (COMPLETED, CANCELLED, etc.)
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update appointment', details: error.message });
  }
});

module.exports = router;

const CustomEvent = require('../models/CustomEvent');

// GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const events = await CustomEvent.find().sort({ startTime: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const { title, description, startTime, endTime } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (title, startTime, endTime)' });
    }

    const event = await CustomEvent.create({
      title,
      description,
      startTime,
      endTime,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

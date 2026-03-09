const CustomEvent = require('../models/CustomEvent');

// GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const events = await CustomEvent.find({ userId: req.user }).sort({ startTime: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách sự kiện', error: error.message });
  }
};

// POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const { title, description, startTime, endTime } = req.body;

    const newEvent = await CustomEvent.create({
      userId: req.user,
      title,
      description,
      startTime,
      endTime,
    });

    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo sự kiện', error: error.message });
  }
};

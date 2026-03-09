const SubjectSetting = require('../models/SubjectSetting');

// GET /api/subjects
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await SubjectSetting.find({ userId: req.user }).sort({ createdAt: -1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách môn học', error: error.message });
  }
};

// PUT /api/subjects/:code
exports.updateSubject = async (req, res) => {
  try {
    const { code } = req.params;
    const updates = req.body;

    const subject = await SubjectSetting.findOneAndUpdate(
      { subjectCode: code, userId: req.user },
      { $set: updates },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ message: 'Không tìm thấy môn học' });
    }

    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật môn học', error: error.message });
  }
};

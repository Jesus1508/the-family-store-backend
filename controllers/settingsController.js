const Settings = require("../models/Settings");

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener la configuración", error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }
    Object.assign(settings, req.body);
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar la configuración", error: error.message });
  }
};

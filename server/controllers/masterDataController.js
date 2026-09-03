const State = require('../models/masterData/State');

// Utility to handle dynamic model mapping if needed in future
// For now, we will implement explicit controllers for the Core phase

// --- STATE LIST ---
exports.getStates = async (req, res) => {
  try {
    const states = await State.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: states });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch states', error: error.message });
  }
};

exports.addState = async (req, res) => {
  try {
    const { state_name, state_code } = req.body;
    
    if (!state_name || !state_code) {
      return res.status(400).json({ success: false, message: 'State Name and State Code are required' });
    }

    const newState = new State({ state_name, state_code });
    await newState.save();
    
    res.status(201).json({ success: true, message: 'State added successfully', data: newState });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add state', error: error.message });
  }
};

exports.updateState = async (req, res) => {
  try {
    const { id } = req.params;
    const { state_name, state_code } = req.body;

    const updatedState = await State.findByIdAndUpdate(
      id, 
      { state_name, state_code },
      { new: true, runValidators: true }
    );

    if (!updatedState) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }

    res.status(200).json({ success: true, message: 'State updated successfully', data: updatedState });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update state', error: error.message });
  }
};

exports.deleteState = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedState = await State.findByIdAndDelete(id);
    
    if (!deletedState) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }

    res.status(200).json({ success: true, message: 'State deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete state', error: error.message });
  }
};

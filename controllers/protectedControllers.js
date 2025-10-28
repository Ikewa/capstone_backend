export const getHome = (req, res) => {
  res.json({ 
    message: "Welcome to Home!", 
    user: req.user 
  });
};

export const getNotifications = (req, res) => {
  res.json({ 
    message: "Welcome to Notifications!", 
    user: req.user 
  });
};

export const getCrop = (req, res) => {
  res.json({ 
    message: "Welcome to Crop Recommendations!", 
    user: req.user 
  });
};

export const getBooking = (req, res) => {
  res.json({ 
    message: "Welcome to Booking!", 
    user: req.user 
  });
};

export const getEvents = (req, res) => {
  res.json({ 
    message: "Welcome to Events!", 
    user: req.user 
  });
};

export const getMap = (req, res) => {
  res.json({ 
    message: "Welcome to Map!", 
    user: req.user 
  });
};

export const getSettings = (req, res) => {
  res.json({ 
    message: "Welcome to Settings!", 
    user: req.user 
  });
};
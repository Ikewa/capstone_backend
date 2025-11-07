import db from "../config/db.js";

// Helper function for promises
function queryPromise(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

// ==================== MAIN USSD HANDLER ====================
export const handleUSSD = async (req, res) => {
  try {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    console.log('📱 USSD Request:', { sessionId, serviceCode, phoneNumber, text });

    // Log the request
    await logUSSDRequest(sessionId, phoneNumber, text, 'incoming');

    // Get or create session
    let session = await getSession(sessionId, phoneNumber);

    // Parse user input
    const textArray = text.split('*').filter(t => t !== '');
    const userInput = textArray[textArray.length - 1] || '';

    let response = '';

    // Route to appropriate menu based on session state
    if (text === '') {
      // Main menu
      response = await mainMenu(session);
    } else if (session.current_menu === 'main') {
      response = await handleMainMenuSelection(session, userInput, textArray);
    } else {
      // Handle submenu selections
      response = await handleSubmenu(session, userInput, textArray);
    }

    // Log response
    await logUSSDRequest(sessionId, phoneNumber, response, 'outgoing');

    // Send response
    res.set('Content-Type', 'text/plain');
    res.send(response);

  } catch (error) {
    console.error('💥 USSD Error:', error);
    res.set('Content-Type', 'text/plain');
    res.send('END An error occurred. Please try again.');
  }
};

// ==================== GET OR CREATE SESSION ====================
async function getSession(sessionId, phoneNumber) {
  let [session] = await queryPromise(
    'SELECT * FROM ussd_sessions WHERE session_id = ?',
    [sessionId]
  );

  if (!session) {
    // Create new session
    await queryPromise(
      `INSERT INTO ussd_sessions (session_id, phone_number, current_menu, expires_at) 
       VALUES (?, ?, 'main', DATE_ADD(NOW(), INTERVAL 5 MINUTE))`,
      [sessionId, phoneNumber]
    );

    [session] = await queryPromise(
      'SELECT * FROM ussd_sessions WHERE session_id = ?',
      [sessionId]
    );
  }

  // Check if user is registered
  if (!session.user_id) {
    const [user] = await queryPromise(
      'SELECT id FROM users WHERE phone = ?',
      [phoneNumber]
    );

    if (user) {
      await queryPromise(
        'UPDATE ussd_sessions SET user_id = ? WHERE session_id = ?',
        [user.id, sessionId]
      );
      session.user_id = user.id;
    }
  }

  return session;
}

// ==================== UPDATE SESSION ====================
async function updateSession(sessionId, menu, data = null) {
  await queryPromise(
    'UPDATE ussd_sessions SET current_menu = ?, menu_data = ?, updated_at = NOW() WHERE session_id = ?',
    [menu, data ? JSON.stringify(data) : null, sessionId]
  );
}

// ==================== LOG USSD REQUEST ====================
async function logUSSDRequest(sessionId, phoneNumber, content, type) {
  await queryPromise(
    'INSERT INTO ussd_logs (session_id, phone_number, user_input, response_sent) VALUES (?, ?, ?, ?)',
    [sessionId, phoneNumber, type === 'incoming' ? content : null, type === 'outgoing' ? content : null]
  );
}

// ==================== MAIN MENU ====================
async function mainMenu(session) {
  await updateSession(session.session_id, 'main');

  let response = 'CON Welcome to AgriConnect\n';
  
  if (session.user_id) {
    response += 'Choose an option:\n';
  } else {
    response += 'Please register/login first:\n';
  }

  response += '1. View Crop Prices\n';
  response += '2. Weather Information\n';
  response += '3. Ask a Question\n';
  response += '4. View My Questions\n';
  response += '5. Upcoming Events\n';
  response += '6. Book Consultation\n';
  response += '7. Register/Login\n';
  response += '0. Exit';

  return response;
}

// ==================== HANDLE MAIN MENU SELECTION ====================
async function handleMainMenuSelection(session, input, textArray) {
  switch (input) {
    case '1':
      await updateSession(session.session_id, 'crop_prices');
      return cropPricesMenu();
    
    case '2':
      await updateSession(session.session_id, 'weather_location');
      return 'CON Enter your location (e.g., Kano):';
    
    case '3':
      if (!session.user_id) {
        return 'END Please register/login first to ask questions.';
      }
      await updateSession(session.session_id, 'ask_question_category');
      return askQuestionCategoryMenu();
    
    case '4':
      if (!session.user_id) {
        return 'END Please register/login first.';
      }
      return await viewMyQuestions(session);
    
    case '5':
      return await upcomingEvents();
    
    case '6':
      if (!session.user_id) {
        return 'END Please register/login first to book consultation.';
      }
      await updateSession(session.session_id, 'booking_date');
      return 'CON Book Consultation\nEnter preferred date (DD/MM/YYYY):';
    
    case '7':
      await updateSession(session.session_id, 'register_login');
      return 'CON Register/Login\n1. Register\n2. Login\n0. Back';
    
    case '0':
      return 'END Thank you for using AgriConnect!';
    
    default:
      return 'END Invalid option. Please try again.';
  }
}

// ==================== HANDLE SUBMENU ====================
async function handleSubmenu(session, input, textArray) {
  const menu = session.current_menu;

  switch (menu) {
    case 'crop_prices':
      return await handleCropPriceSelection(session, input);
    
    case 'weather_location':
      return await getWeatherInfo(session, input);
    
    case 'ask_question_category':
      return await handleQuestionCategory(session, input);
    
    case 'ask_question_title':
      await updateSession(session.session_id, 'ask_question_description', { title: input });
      return 'CON Enter question description:';
    
    case 'ask_question_description':
      return await saveQuestion(session, input);
    
    case 'register_login':
      return await handleRegisterLogin(session, input);
    
    case 'register_name':
      await updateSession(session.session_id, 'register_location', { name: input });
      return 'CON Enter your location:';
    
    case 'register_location':
      return await completeRegistration(session, input);
    
    default:
      return await mainMenu(session);
  }
}

// ==================== CROP PRICES MENU ====================
function cropPricesMenu() {
  return 'CON Select Crop:\n1. Rice\n2. Maize\n3. Yam\n4. Tomatoes\n5. Onions\n0. Back';
}

async function handleCropPriceSelection(session, input) {
  const crops = {
    '1': 'Rice',
    '2': 'Maize',
    '3': 'Yam',
    '4': 'Tomatoes',
    '5': 'Onions'
  };

  if (input === '0') {
    return await mainMenu(session);
  }

  const cropName = crops[input];
  if (!cropName) {
    return 'END Invalid selection.';
  }

  const prices = await queryPromise(
    'SELECT * FROM market_prices WHERE crop_name = ? ORDER BY updated_at DESC LIMIT 3',
    [cropName]
  );

  if (prices.length === 0) {
    return `END No price data available for ${cropName}.`;
  }

  let response = `END ${cropName} Prices:\n\n`;
  prices.forEach(price => {
    response += `${price.market_location}\n`;
    response += `N${price.price.toLocaleString()} ${price.unit}\n`;
    response += `Updated: ${new Date(price.updated_at).toLocaleDateString()}\n\n`;
  });

  return response;
}

// ==================== WEATHER INFO ====================
async function getWeatherInfo(session, location) {
  // In production, integrate with weather API
  // For now, return mock data
  return `END Weather for ${location}:\n\nTemperature: 28°C\nCondition: Partly Cloudy\nHumidity: 65%\nGood farming weather!`;
}

// ==================== ASK QUESTION ====================
function askQuestionCategoryMenu() {
  return 'CON Select Category:\n1. Pest Control\n2. Irrigation\n3. Crop Management\n4. Fertilizers\n5. General\n0. Back';
}

async function handleQuestionCategory(session, input) {
  const categories = {
    '1': 'Pest Control',
    '2': 'Irrigation',
    '3': 'Crop Management',
    '4': 'Fertilizers',
    '5': 'General'
  };

  if (input === '0') {
    return await mainMenu(session);
  }

  const category = categories[input];
  if (!category) {
    return 'END Invalid selection.';
  }

  await updateSession(session.session_id, 'ask_question_title', { category });
  return 'CON Enter your question title:';
}

async function saveQuestion(session, description) {
  try {
    const menuData = JSON.parse(session.menu_data);
    const title = menuData.title;
    const category = menuData.category;

    await queryPromise(
      'INSERT INTO questions (user_id, title, description, category) VALUES (?, ?, ?, ?)',
      [session.user_id, title, description, category]
    );

    return 'END Your question has been posted successfully! You will receive answers via SMS.';
  } catch (error) {
    console.error('Error saving question:', error);
    return 'END Failed to post question. Please try again.';
  }
}

// ==================== VIEW MY QUESTIONS ====================
async function viewMyQuestions(session) {
  const questions = await queryPromise(
    `SELECT id, title, created_at, 
     (SELECT COUNT(*) FROM answers WHERE question_id = questions.id) as answer_count
     FROM questions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5`,
    [session.user_id]
  );

  if (questions.length === 0) {
    return 'END You have not asked any questions yet.';
  }

  let response = 'END Your Recent Questions:\n\n';
  questions.forEach((q, index) => {
    response += `${index + 1}. ${q.title}\n`;
    response += `Answers: ${q.answer_count}\n`;
    response += `Date: ${new Date(q.created_at).toLocaleDateString()}\n\n`;
  });

  return response;
}

// ==================== UPCOMING EVENTS ====================
async function upcomingEvents() {
  const events = await queryPromise(
    `SELECT title, event_date, location FROM events 
     WHERE event_date >= CURDATE() 
     ORDER BY event_date ASC LIMIT 5`
  );

  if (events.length === 0) {
    return 'END No upcoming events.';
  }

  let response = 'END Upcoming Events:\n\n';
  events.forEach((event, index) => {
    response += `${index + 1}. ${event.title}\n`;
    response += `Date: ${new Date(event.event_date).toLocaleDateString()}\n`;
    response += `Location: ${event.location}\n\n`;
  });

  return response;
}

// ==================== REGISTER/LOGIN ====================
async function handleRegisterLogin(session, input) {
  if (input === '1') {
    await updateSession(session.session_id, 'register_name');
    return 'CON Register\nEnter your full name:';
  } else if (input === '2') {
    // Check if phone is registered
    const [user] = await queryPromise(
      'SELECT id, first_name FROM users WHERE phone = ?',
      [session.phone_number]
    );

    if (user) {
      await queryPromise(
        'UPDATE ussd_sessions SET user_id = ? WHERE session_id = ?',
        [user.id, session.session_id]
      );
      return `END Welcome back, ${user.first_name}! You are now logged in.`;
    } else {
      return 'END Phone number not registered. Please register first.';
    }
  } else if (input === '0') {
    return await mainMenu(session);
  } else {
    return 'END Invalid option.';
  }
}

async function completeRegistration(session, location) {
  try {
    const menuData = JSON.parse(session.menu_data);
    const fullName = menuData.name;
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Create user account
    const result = await queryPromise(
      `INSERT INTO users (first_name, last_name, phone, location, role, password) 
       VALUES (?, ?, ?, ?, 'Farmer', 'ussd_user')`,
      [firstName, lastName, session.phone_number, location]
    );

    // Update session with user_id
    await queryPromise(
      'UPDATE ussd_sessions SET user_id = ? WHERE session_id = ?',
      [result.insertId, session.session_id]
    );

    return `END Registration successful!\nWelcome ${firstName}!\nYou can now access all AgriConnect services.`;
  } catch (error) {
    console.error('Registration error:', error);
    return 'END Registration failed. Please try again or contact support.';
  }
}
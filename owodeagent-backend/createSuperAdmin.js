require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Agent = require('./models/Agent');

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingAdmin = await Agent.findOne({ email: 'info@owodealajo.com' });
    if (existingAdmin) {
      console.log('First super admin already exists, skipping...');
    } else {
      // Hash password
      const passwordHash = await bcrypt.hash('Clement7#', 10);

      // Create super admin
      const superAdmin = new Agent({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'info@owodealajo.com',
        phone: '+1234567890', // placeholder
        passwordHash,
        status: 'approved',
        role: 'super-admin'
      });

      await superAdmin.save();
      console.log('Super admin created successfully!');
      console.log('Email: info@owodealajo.com');
      console.log('Password: Clement7#');
    }

    // Create second admin
    const secondAdminPasswordHash = await bcrypt.hash('shindara@33', 10);
    const secondAdmin = new Agent({
      firstName: 'Aminati',
      lastName: 'Yiola',
      email: 'aminatiyiola7@gmail.com', // Correct email as requested
      phone: '+1234567891', // placeholder
      passwordHash: secondAdminPasswordHash,
      status: 'approved',
      role: 'super-admin'
    });

    await secondAdmin.save();
    console.log('Second admin created successfully!');
    console.log('Email: aminatiyiola7@gmail.com');
    console.log('Password: shindara@33');

    // Send congratulatory email to new admin
    const { sendEmail } = require('./utils/resendEmail');
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Congratulations! You're Now an Admin</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 40px 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .tagline { font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; text-align: center; }
          .title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; }
          .promotion-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; margin: 20px 0; text-align: center; }
          .promotion-message { font-size: 18px; margin-bottom: 15px; }
          .admin-info { background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; margin: 15px 0; }
          .feature-list { margin: 25px 0; text-align: left; }
          .feature { background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 10px 0; border-left: 4px solid #667eea; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; }
          .success-icon { font-size: 48px; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Owode Agent</div>
            <div class="tagline">Admin Management System</div>
          </div>

          <div class="content">
            <h1 class="title">🎉 Congratulations! You're Now an Admin!</h1>

            <div class="promotion-card">
              <div class="success-icon">✅</div>
              <div class="promotion-message">
                You have been promoted from Agent to Administrator!
              </div>
              <div class="admin-info">
                <strong>Your New Admin Account:</strong><br>
                Email: aminatiyiola7@gmail.com<br>
                Password: shindara@33
              </div>
            </div>

            <div class="feature-list">
              <h3 style="color: #333; margin-bottom: 15px;">What You Can Do Now:</h3>

              <div class="feature">
                <strong>👥 View All Agents</strong><br>
                See and manage all agents in the system
              </div>

              <div class="feature">
                <strong>👥 View All Customers</strong><br>
                Access customer data from all agents
              </div>

              <div class="feature">
                <strong>💰 Full Payment Oversight</strong><br>
                Monitor all payments and transactions
              </div>

              <div class="feature">
                <strong>⚙️ System Administration</strong><br>
                Manage system settings and approvals
              </div>
            </div>

            <p style="text-align: center; margin-top: 20px; color: #666;">
              Please log in with your new admin credentials to access the admin dashboard.
            </p>
          </div>

          <div class="footer">
            <p>This email confirms your admin promotion</p>
            <p>© 2024 Owode Agent Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(
      'aminatiyiola7@gmail.com',
      '🎉 Congratulations! You\'re Now an Admin!',
      adminEmailHtml
    );
    console.log('Admin promotion email sent to aminatiyiola7@gmail.com');

  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createSuperAdmin();

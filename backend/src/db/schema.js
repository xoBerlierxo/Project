const db = require('./connection');

function createSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('SEEKER', 'CREATOR', 'ADMIN')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS creator_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      photo_url TEXT,
      company TEXT,
      current_status TEXT NOT NULL DEFAULT 'WORKING' CHECK (current_status IN ('WORKING', 'NOT_WORKING')),
      linkedin_url TEXT NOT NULL,
      job_title TEXT,
      years_experience INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION'
        CHECK (status IN ('DRAFT', 'PENDING_VERIFICATION', 'CHANGES_REQUIRED', 'APPROVED', 'REJECTED', 'UNPUBLISHED')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS creator_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id INTEGER NOT NULL REFERENCES creator_profiles(id),
      category TEXT NOT NULL CHECK (category IN (
        'CONSULTATION', 'RESUME_REVIEW', 'PORTFOLIO_REVIEW',
        'MOCK_INTERVIEW', 'MENTORSHIP', 'VERIFIED_REFERRAL'
      )),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      duration_minutes INTEGER,
      price INTEGER NOT NULL,
      meeting_required INTEGER NOT NULL DEFAULT 0,
      delivery_time TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS availability_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL REFERENCES creator_services(id),
      weekday TEXT NOT NULL CHECK (weekday IN ('MON','TUE','WED','THU','FRI','SAT','SUN')),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id INTEGER NOT NULL REFERENCES creator_profiles(id),
      verification_type TEXT NOT NULL DEFAULT 'MANUAL_ADMIN_REVIEW',
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'FAILED')),
      checked_by INTEGER REFERENCES users(id),
      checked_at TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS admin_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL REFERENCES users(id),
      creator_id INTEGER NOT NULL REFERENCES creator_profiles(id),
      action TEXT NOT NULL CHECK (action IN ('APPROVE', 'REJECT', 'REQUEST_CHANGES', 'UNPUBLISH')),
      reason TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS service_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id INTEGER NOT NULL REFERENCES creator_profiles(id),
      service_id INTEGER NOT NULL REFERENCES creator_services(id),
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_creator_profiles_status ON creator_profiles(status);
    CREATE INDEX IF NOT EXISTS idx_creator_services_creator_id ON creator_services(creator_id);
    CREATE INDEX IF NOT EXISTS idx_creator_services_category ON creator_services(category);
    CREATE INDEX IF NOT EXISTS idx_availability_slots_service_id ON availability_slots(service_id);
    CREATE INDEX IF NOT EXISTS idx_service_requests_creator_id ON service_requests(creator_id);
  `);
}

module.exports = { createSchema };

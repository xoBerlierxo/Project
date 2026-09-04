const bcrypt = require('bcrypt');
const db = require('./connection');
const env = require('../config/env');

const REFERRAL_DISCLAIMER =
  'Referral assistance / referral submission subject to creator eligibility and company process. This is not a guaranteed interview, offer, or job.';

function clearData() {
  db.exec(`
    DELETE FROM admin_actions;
    DELETE FROM service_requests;
    DELETE FROM availability_slots;
    DELETE FROM creator_services;
    DELETE FROM verifications;
    DELETE FROM creator_profiles;
    DELETE FROM users;
  `);
}

function insertUser(email, role, plainPassword) {
  const hash = bcrypt.hashSync(plainPassword, 10);
  const result = db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)').run(email, hash, role);
  return result.lastInsertRowid;
}

function insertCreator(userId, profile, adminId) {
  const result = db.prepare(`
    INSERT INTO creator_profiles
      (user_id, name, photo_url, company, current_status, linkedin_url, job_title, years_experience, description, status)
    VALUES (@user_id, @name, @photo_url, @company, @current_status, @linkedin_url, @job_title, @years_experience, @description, @status)
  `).run({ user_id: userId, ...profile });

  const creatorId = result.lastInsertRowid;

  db.prepare(`
    INSERT INTO verifications (creator_id, verification_type, status, checked_by, checked_at, notes)
    VALUES (?, 'MANUAL_ADMIN_REVIEW', ?, ?, ?, ?)
  `).run(
    creatorId,
    profile.status === 'APPROVED' ? 'VERIFIED' : profile.status === 'REJECTED' ? 'FAILED' : 'PENDING',
    profile.status === 'APPROVED' || profile.status === 'REJECTED' ? adminId : null,
    profile.status === 'APPROVED' || profile.status === 'REJECTED' ? new Date().toISOString() : null,
    profile.status === 'REJECTED' ? 'LinkedIn profile could not be verified against stated employer.' :
      profile.status === 'CHANGES_REQUIRED' ? 'Please add years of experience and a clearer description.' : null,
  );

  return creatorId;
}

function insertService(creatorId, service) {
  const result = db.prepare(`
    INSERT INTO creator_services
      (creator_id, category, name, description, duration_minutes, price, meeting_required, delivery_time)
    VALUES (@creator_id, @category, @name, @description, @duration_minutes, @price, @meeting_required, @delivery_time)
  `).run({ creator_id: creatorId, ...service });

  const serviceId = result.lastInsertRowid;

  for (const slot of service.availability || []) {
    db.prepare(`
      INSERT INTO availability_slots (service_id, weekday, start_time, end_time, timezone)
      VALUES (?, ?, ?, ?, ?)
    `).run(serviceId, slot.weekday, slot.start_time, slot.end_time, 'Asia/Kolkata');
  }

  return serviceId;
}

function seed() {
  clearData();

  const adminId = insertUser(env.adminEmail, 'ADMIN', env.adminPassword);

  // --- Approved creators ---
  const aaravUser = insertUser('aarav.mehta.demo@example.com', 'CREATOR', 'creator123');
  const aaravId = insertCreator(aaravUser, {
    name: 'Aarav Mehta', photo_url: null, company: 'DemoTech', current_status: 'WORKING',
    linkedin_url: 'https://linkedin.com/in/aarav-mehta-demo', job_title: 'Software Engineer',
    years_experience: 4, description: 'I help engineers prep for backend and system design interviews.',
    status: 'APPROVED',
  }, adminId);
  insertService(aaravId, {
    category: 'CONSULTATION', name: '30-min Career Consultation',
    description: 'Career guidance call covering growth, switching roles, and negotiation.',
    duration_minutes: 30, price: 499, meeting_required: 1, delivery_time: null,
    availability: [{ weekday: 'WED', start_time: '18:00', end_time: '20:00' }],
  });
  insertService(aaravId, {
    category: 'MOCK_INTERVIEW', name: 'Backend Mock Interview',
    description: 'Full mock interview with system design and coding rounds.',
    duration_minutes: 60, price: 999, meeting_required: 1, delivery_time: null,
    availability: [{ weekday: 'SAT', start_time: '10:00', end_time: '13:00' }],
  });

  const priyaUser = insertUser('priya.sharma.demo@example.com', 'CREATOR', 'creator123');
  const priyaId = insertCreator(priyaUser, {
    name: 'Priya Sharma', photo_url: null, company: null, current_status: 'NOT_WORKING',
    linkedin_url: 'https://linkedin.com/in/priya-sharma-demo', job_title: null,
    years_experience: 6, description: 'Ex-recruiter helping candidates polish resumes and portfolios.',
    status: 'APPROVED',
  }, adminId);
  insertService(priyaId, {
    category: 'RESUME_REVIEW', name: 'Resume Review',
    description: 'Detailed written feedback on structure, impact statements, and ATS formatting.',
    duration_minutes: null, price: 299, meeting_required: 0, delivery_time: 'Delivered within 48 hours',
  });
  insertService(priyaId, {
    category: 'PORTFOLIO_REVIEW', name: 'Portfolio Review',
    description: 'Feedback on portfolio structure, case studies, and presentation.',
    duration_minutes: null, price: 349, meeting_required: 0, delivery_time: 'Delivered within 72 hours',
  });

  const rohanUser = insertUser('rohan.verma.demo@example.com', 'CREATOR', 'creator123');
  const rohanId = insertCreator(rohanUser, {
    name: 'Rohan Verma', photo_url: null, company: 'NimbusSoft', current_status: 'WORKING',
    linkedin_url: 'https://linkedin.com/in/rohan-verma-demo', job_title: 'Product Manager',
    years_experience: 7, description: 'PM mentor for aspiring and early-career product managers.',
    status: 'APPROVED',
  }, adminId);
  insertService(rohanId, {
    category: 'MENTORSHIP', name: 'PM Mentorship Session',
    description: 'Structured guidance session on breaking into product management.',
    duration_minutes: 45, price: 799, meeting_required: 1, delivery_time: null,
    availability: [{ weekday: 'TUE', start_time: '19:00', end_time: '21:00' }],
  });

  const ishitaUser = insertUser('ishita.kapoor.demo@example.com', 'CREATOR', 'creator123');
  const ishitaId = insertCreator(ishitaUser, {
    name: 'Ishita Kapoor', photo_url: null, company: 'CloudNine Labs', current_status: 'WORKING',
    linkedin_url: 'https://linkedin.com/in/ishita-kapoor-demo', job_title: 'Senior Data Scientist',
    years_experience: 8, description: 'I run mock interviews and mentorship for data science roles.',
    status: 'APPROVED',
  }, adminId);
  insertService(ishitaId, {
    category: 'MOCK_INTERVIEW', name: 'Data Science Mock Interview',
    description: 'Statistics, ML case studies, and take-home review discussion.',
    duration_minutes: 60, price: 1499, meeting_required: 1, delivery_time: null,
    availability: [{ weekday: 'SUN', start_time: '11:00', end_time: '14:00' }],
  });
  insertService(ishitaId, {
    category: 'MENTORSHIP', name: 'Data Science Mentorship',
    description: 'Ongoing career guidance for data scientists.',
    duration_minutes: 30, price: 599, meeting_required: 1, delivery_time: null,
    availability: [{ weekday: 'THU', start_time: '18:30', end_time: '20:00' }],
  });

  const karanUser = insertUser('karan.malhotra.demo@example.com', 'CREATOR', 'creator123');
  const karanId = insertCreator(karanUser, {
    name: 'Karan Malhotra', photo_url: null, company: 'BrightWave Inc', current_status: 'WORKING',
    linkedin_url: 'https://linkedin.com/in/karan-malhotra-demo', job_title: 'Engineering Manager',
    years_experience: 10, description: 'I offer referral assistance for engineering roles at BrightWave.',
    status: 'APPROVED',
  }, adminId);
  insertService(karanId, {
    category: 'VERIFIED_REFERRAL', name: 'Verified Referral — BrightWave Inc',
    description: REFERRAL_DISCLAIMER,
    duration_minutes: null, price: 999, meeting_required: 0, delivery_time: 'Submission attempted within 5 business days, subject to open roles',
  });
  insertService(karanId, {
    category: 'CONSULTATION', name: 'Engineering Career Consultation',
    description: 'Advice on leveling, interview loops, and team fit at product companies.',
    duration_minutes: 30, price: 599, meeting_required: 1, delivery_time: null,
    availability: [{ weekday: 'MON', start_time: '18:00', end_time: '19:30' }],
  });

  const snehaUser = insertUser('sneha.reddy.demo@example.com', 'CREATOR', 'creator123');
  const snehaId = insertCreator(snehaUser, {
    name: 'Sneha Reddy', photo_url: null, company: 'PixelForge', current_status: 'WORKING',
    linkedin_url: 'https://linkedin.com/in/sneha-reddy-demo', job_title: 'UX Designer',
    years_experience: 5, description: 'I review design portfolios and resumes for design roles.',
    status: 'APPROVED',
  }, adminId);
  insertService(snehaId, {
    category: 'PORTFOLIO_REVIEW', name: 'UX Portfolio Review',
    description: 'Case-study-level feedback for UX/product design portfolios.',
    duration_minutes: null, price: 449, meeting_required: 0, delivery_time: 'Delivered within 48 hours',
  });
  insertService(snehaId, {
    category: 'RESUME_REVIEW', name: 'Design Resume Review',
    description: 'Feedback tailored for design-role resumes and ATS screening.',
    duration_minutes: null, price: 299, meeting_required: 0, delivery_time: 'Delivered within 48 hours',
  });

  // --- Non-approved creators (verification workflow demo) ---
  const vikramUser = insertUser('vikram.singh.demo@example.com', 'CREATOR', 'creator123');
  const vikramId = insertCreator(vikramUser, {
    name: 'Vikram Singh', photo_url: null, company: 'Quantum Systems', current_status: 'WORKING',
    linkedin_url: 'https://linkedin.com/in/vikram-singh-demo', job_title: 'Backend Engineer',
    years_experience: 3, description: 'Newly applied creator awaiting admin verification.',
    status: 'PENDING_VERIFICATION',
  }, adminId);
  insertService(vikramId, {
    category: 'CONSULTATION', name: '30-min Career Consultation',
    description: 'General career consultation call.',
    duration_minutes: 30, price: 399, meeting_required: 1, delivery_time: null,
    availability: [{ weekday: 'FRI', start_time: '19:00', end_time: '20:00' }],
  });

  const ananyaUser = insertUser('ananya.iyer.demo@example.com', 'CREATOR', 'creator123');
  const ananyaId = insertCreator(ananyaUser, {
    name: 'Ananya Iyer', photo_url: null, company: null, current_status: 'NOT_WORKING',
    linkedin_url: 'https://linkedin.com/in/ananya-iyer-demo', job_title: null,
    years_experience: 2, description: 'Resume reviewer, application needs more detail.',
    status: 'CHANGES_REQUIRED',
  }, adminId);
  insertService(ananyaId, {
    category: 'RESUME_REVIEW', name: 'Resume Review',
    description: 'Resume feedback for early-career applicants.',
    duration_minutes: null, price: 199, meeting_required: 0, delivery_time: 'Delivered within 48 hours',
  });

  const devanshUser = insertUser('devansh.rao.demo@example.com', 'CREATOR', 'creator123');
  const devanshId = insertCreator(devanshUser, {
    name: 'Devansh Rao', photo_url: null, company: 'FakeCorp', current_status: 'WORKING',
    linkedin_url: 'https://linkedin.com/in/devansh-rao-demo', job_title: 'Interviewer',
    years_experience: 1, description: 'Application rejected: unable to verify professional identity.',
    status: 'REJECTED',
  }, adminId);
  insertService(devanshId, {
    category: 'MOCK_INTERVIEW', name: 'Mock Interview',
    description: 'General mock interview practice.',
    duration_minutes: 45, price: 499, meeting_required: 1, delivery_time: null,
    availability: [{ weekday: 'SAT', start_time: '09:00', end_time: '10:00' }],
  });

  const meeraUser = insertUser('meera.nair.demo@example.com', 'CREATOR', 'creator123');
  const meeraId = insertCreator(meeraUser, {
    name: 'Meera Nair', photo_url: null, company: 'Horizon Analytics', current_status: 'WORKING',
    linkedin_url: 'https://linkedin.com/in/meera-nair-demo', job_title: 'Analytics Lead',
    years_experience: 9, description: 'Previously approved creator, temporarily unpublished.',
    status: 'UNPUBLISHED',
  }, adminId);
  insertService(meeraId, {
    category: 'MENTORSHIP', name: 'Analytics Career Mentorship',
    description: 'Mentorship for analytics and BI career paths.',
    duration_minutes: 30, price: 699, meeting_required: 1, delivery_time: null,
    availability: [{ weekday: 'THU', start_time: '20:00', end_time: '21:00' }],
  });

  for (const id of [aaravId, priyaId, rohanId, ishitaId, karanId, snehaId]) {
    db.prepare(`INSERT INTO admin_actions (admin_id, creator_id, action, reason) VALUES (?, ?, 'APPROVE', NULL)`).run(adminId, id);
  }

  db.prepare(`INSERT INTO admin_actions (admin_id, creator_id, action, reason) VALUES (?, ?, 'REJECT', ?)`)
    .run(adminId, devanshId, 'LinkedIn profile could not be verified against stated employer.');
  db.prepare(`INSERT INTO admin_actions (admin_id, creator_id, action, reason) VALUES (?, ?, 'REQUEST_CHANGES', ?)`)
    .run(adminId, ananyaId, 'Please add years of experience and a clearer description.');
  db.prepare(`INSERT INTO admin_actions (admin_id, creator_id, action, reason) VALUES (?, ?, 'UNPUBLISH', ?)`)
    .run(adminId, meeraId, 'Temporarily paused at creator request.');

  console.log('Seed data inserted: 6 approved, 1 pending, 1 changes-required, 1 rejected, 1 unpublished.');
}

if (require.main === module) {
  seed();
}

module.exports = { seed };

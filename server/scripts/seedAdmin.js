'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const readline = require('readline');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const args = process.argv.slice(2);

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const email       = args[0] || await prompt('Email: ');
  const displayName = args[1] || await prompt('Display name: ');
  const password    = args[2] || await prompt('Password: ');

  if (!email || !displayName || !password) {
    console.error('Email, display name, and password are all required.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await db.query(
    `INSERT INTO users (id, email, display_name, role, is_enabled, password_hash)
     VALUES ($1, $2, $3, 'admin', true, $4)
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           role          = 'admin',
           is_enabled    = true,
           updated_at    = now()
     RETURNING id, email, display_name, role`,
    [uuidv4(), email, displayName, passwordHash]
  );

  console.log('Admin user seeded:', result.rows[0]);
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});

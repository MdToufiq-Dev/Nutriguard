import crypto from 'crypto';
import pool from '../pool.js';

export const ComplianceModel = {
  async getLogByUserId(userId) {
    const res = await pool.query(
      `SELECT id, user_id as "userId", TO_CHAR(date, 'YYYY-MM-DD') as date, status, updated_at as "updatedAt"
       FROM compliance
       WHERE user_id = $1
       ORDER BY date DESC`,
      [userId]
    );
    return res.rows;
  },

  async getByDate(userId, date) {
    const res = await pool.query(
      `SELECT id, user_id as "userId", TO_CHAR(date, 'YYYY-MM-DD') as date, status, updated_at as "updatedAt"
       FROM compliance
       WHERE user_id = $1 AND date = $2`,
      [userId, date]
    );
    return res.rows[0] || null;
  },

  async setCompliance(userId, date, status) {
    const id = `compliance_${userId}_${date}`;
    const query = `
      INSERT INTO compliance (id, user_id, date, status, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, date) DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, user_id as "userId", TO_CHAR(date, 'YYYY-MM-DD') as date, status, updated_at as "updatedAt";
    `;
    const res = await pool.query(query, [id, userId, date, status]);
    return res.rows[0];
  },

  async deleteByDate(userId, date) {
    const res = await pool.query(
      'DELETE FROM compliance WHERE user_id = $1 AND date = $2 RETURNING id',
      [userId, date]
    );
    return res.rowCount > 0;
  },

  calculateStreak(complianceLog) {
    if (!complianceLog || complianceLog.length === 0) {
      return 0;
    }

    const sorted = [...complianceLog].sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDate(today);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    const mostRecent = sorted.find(log => log.status === 'followed');
    if (!mostRecent) {
      return 0;
    }

    if (mostRecent.date !== todayStr && mostRecent.date !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    let currentDate = new Date(mostRecent.date);

    for (const log of sorted) {
      const logDate = formatDate(currentDate);

      if (log.date === logDate && log.status === 'followed') {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (log.date === logDate) {
        break;
      }
    }

    return streak;
  }
};

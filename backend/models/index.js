/**
 * Models Index
 * Export tất cả models để import dễ dàng
 */

const User = require('./User');
const Driver = require('./Driver');
const Parent = require('./Parent');
const Student = require('./Student');
const Bus = require('./Bus');
const Route = require('./Route');
const Schedule = require('./Schedule');
const Tracking = require('./Tracking');
const Notification = require('./Notification');
const Message = require('./Message');
const Incident = require('./Incident');

module.exports = {
  User,
  Driver,
  Parent,
  Student,
  Bus,
  Route,
  Schedule,
  Tracking,
  Notification,
  Message,
  Incident
};

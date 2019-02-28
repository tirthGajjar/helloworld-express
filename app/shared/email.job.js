'use strict';

const CONFIG = require('@/common/config');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const Queue = require('bull');

const name = $jobname(__filename);

const queue = new Queue(name, CONFIG.REDIS_JOB_URI);

const { default: NotifmeSdk } = require('notifme-sdk');
const nodemailer = require('nodemailer');

const ejs = require('ejs');
const juice = require('juice');

let notifmeSdk;
let transport;

const TEMPLATE_CONTEXT_DEFAULTS = {
  CLIENT_APP_URL: CONFIG.CLIENT_APP_URL,
};

async function setup() {
  transport = nodemailer.createTransport(CONFIG.EMAIL_TRANSPORT_URI);

  notifmeSdk = new NotifmeSdk({
    channels: {
      email: {
        providers: [
          {
            type: 'custom',
            id: 'smtp',
            send: async (request) => {
              const result = await transport.sendMail(request);
              return result.messageId;
            },
          },
        ],
      },
    },
    useNotificationCatcher: process.env.NODE_ENV === 'development',
  });
}

async function process(job) {
  const context = {
    ...TEMPLATE_CONTEXT_DEFAULTS,
    subject: job.data.subject,
    ...job.data.templateContext,
  };

  let emailBody = await ejs.renderFile(`${job.data.template}.email.ejs`, context, { async: true });

  emailBody = juice(emailBody);

  notifmeSdk.send({
    email: {
      from: job.data.from || CONFIG.EMAIL_FROM,
      to: job.data.to,
      subject: job.data.subject,
      html: emailBody,
    },
  });
}

module.exports = {
  name,
  queue,
  setup,
  process,
};

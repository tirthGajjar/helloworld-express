'use strict';

const CONFIG = require('@/common/config');

const Logger = require('@/common/logger').createLogger($filepath(__filename));

const Queue = require('bull');

const name = $jobname(__filename);

const queue = new Queue(name, CONFIG.REDIS_JOB_URI);

const { default: NotifmeSdk } = require('notifme-sdk');

const ejs = require('ejs');
const juice = require('juice');

let notifmeSdk;

const TEMPLATE_CONTEXT_DEFAULTS = {
  CLIENT_APP_URL: CONFIG.CLIENT_APP_URL,
};

async function setup() {
  notifmeSdk = new NotifmeSdk({
    channels: {
      email: {
        providers: [
          {
            type: 'smtp',
            url: CONFIG.EMAIL_TRANSPORT_URI,
            // @TODO fix this
          },
        ],
      },
    },
    useNotificationCatcher: process.env.NODE_ENV === 'development',
  });
}

async function processor(job) {
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
  setup,
  name,
  queue,
  processor,
};

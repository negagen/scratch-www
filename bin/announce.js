// this will announce that a deploy successfully finished into slack

const https = require('https');

let environment = process.env.SCRATCH_ENV || 'unknown environment';
let branch = process.env.CIRCLE_BRANCH || 'unknown branch';
let deployer = process.env.CIRCLE_USERNAME || 'unknown deployer';
let commitHash = process.env.CIRCLE_SHA1 || 'unknown commit hash';

let urlEng = process.env.SLACK_WEBHOOK_ENGINEERING;
let urlMod = process.env.SLACK_WEBHOOK_MODS;
let urlNotifications = process.env.SLACK_WEBHOOK_CIRCLECI_NOTIFICATIONS;

let announcementEng = {text: `scratch-www has deployed branch ${branch} to ${environment}` +
` by ${deployer}. The latest commit hash should match ${commitHash}`};
let announcementMod = {text: `scratch-www has deployed to ${environment}.`};

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const postMessage = (url, message, channelName) => {
    let data = JSON.stringify(message);
    const req = https.request(url, options, res => {
        console.log(`statusCode: ${res.statusCode}`); // eslint-disable-line no-console
        if (res.statusCode === 200) {
            process.stdout.write(`announced to ${channelName}\n` + JSON.stringify(message) + '\n');
        } else {
            process.stdout.write(`FAILED to announce to slack`);
        }
    });

    req.on('error', error => {
        console.error(error); // eslint-disable-line no-console
    });

    req.write(data);
    req.end();
};

postMessage(urlNotifications, announcementEng, '#circleci-notifications');

if (environment === 'production'){
    postMessage(urlEng, announcementEng, '#engineering');
    postMessage(urlMod, announcementMod, '#scratch-mods');
}

'use strict';

const IPV4_REGEX =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

const DEFAULT_PORT = 502;
const DEFAULT_UNIT_ID = 247;

initialize();

async function initialize() {

    setText('pageTitle', Homey.__('pair.network.title'));

    setText('title', Homey.__('pair.network.title'));
    setText('subtitle', Homey.__('pair.network.subtitle'));

    setText('ipLabel', Homey.__('pair.network.ip'));
    setText('portLabel', Homey.__('pair.network.port'));
    setText('unitIdLabel', Homey.__('pair.network.unitId'));

    setText('nextButton', Homey.__('pair.network.next'));

    document.getElementById('port').value = DEFAULT_PORT;
    document.getElementById('unitId').value = DEFAULT_UNIT_ID;

    document.getElementById('ip').placeholder =
        Homey.__('pair.network.placeholder.ip');

    ['ip', 'port', 'unitId'].forEach(field => {

        document.getElementById(field).addEventListener('input', () => {

            document.getElementById(field).classList.remove('input-error');
            document.getElementById(`${field}Error`).innerHTML = '';

        });

    });


    document.getElementById('nextButton').addEventListener('click', onNext);
}

function setText(id, text) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = text;
    }
}

async function onNext() {

    const data = {
        ip: document.getElementById('ip').value.trim(),
        port: document.getElementById('port').value,
        unitId: document.getElementById('unitId').value
    };

    const errors = validateInput(data);

    if (hasErrors(errors)) {
        showErrors(errors);
        return;
    }

    clearErrors();

    try {
        await Homey.emit('testConnection', data);
    }
    catch (error) {
        Homey.alert(error.message);
    }
}
function validateInput(data) {

    const errors = {};

    if (!data.ip.trim()) {
        errors.ip = Homey.__('pair.network.errors.ipRequired');
    } else if (!IPV4_REGEX.test(data.ip)) {
        errors.ip = Homey.__('pair.network.errors.invalidIp');
    }

    const port = Number(data.port);

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        errors.port = Homey.__('pair.network.errors.invalidPort');
    }

    const unitId = Number(data.unitId);

    if (!Number.isInteger(unitId) || unitId < 1 || unitId > 247) {
        errors.unitId = Homey.__('pair.network.errors.invalidUnitId');
    }

    return errors;

}
function hasErrors(errors) {

    return Object.keys(errors).length > 0;

}
function clearErrors() {

    ['ip', 'port', 'unitId'].forEach(field => {

        document.getElementById(field).classList.remove('input-error');
        document.getElementById(`${field}Error`).textContent = '';

    });

}
function showErrors(errors) {

    clearErrors();

    Object.entries(errors).forEach(([field, message]) => {

        document.getElementById(`${field}Error`).innerHTML =
            `<span class="error-icon">!</span>${message}`;

        document
            .getElementById(field)
            .classList
            .add('input-error');

    });

}
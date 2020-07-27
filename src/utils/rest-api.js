/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { store } from '../redux/store';
import ReconnectingWebSocket from 'reconnecting-websocket';

let PREFIX_CASE_QUERIES;
let PREFIX_STUDY_QUERIES;
let PREFIX_NOTIFICATION_WS;
if (process.env.REACT_APP_USE_AUTHENTICATION === 'true') {
    PREFIX_CASE_QUERIES = process.env.REACT_APP_API_GATEWAY + '/case';
    PREFIX_STUDY_QUERIES = process.env.REACT_APP_API_GATEWAY + '/study';
    PREFIX_NOTIFICATION_WS = process.env.REACT_APP_WS_GATEWAY + '/notification';
} else {
    PREFIX_CASE_QUERIES = process.env.REACT_APP_API_CASE_SERVER;
    PREFIX_STUDY_QUERIES = process.env.REACT_APP_API_STUDY_SERVER;
    PREFIX_NOTIFICATION_WS = process.env.REACT_APP_WS_NOTIFICATION_SERVER;
}

function getToken() {
    const state = store.getState();
    return state.user.id_token;
}

function backendFetch(url, init) {
    if (!(typeof init == 'undefined' || typeof init == 'object')) {
        throw new TypeError(
            'Argument 2 of backendFetch is not an object' + typeof init
        );
    }
    const initCopy = Object.assign({}, init);
    if (process.env.REACT_APP_USE_AUTHENTICATION === 'true') {
        initCopy.headers = new Headers(initCopy.headers || {});
        initCopy.headers.append('Authorization', 'Bearer ' + getToken());
    }
    return fetch(url, initCopy);
}

export function fetchStudies() {
    console.info('Fetching studies...');
    const fetchStudiesUrl = PREFIX_STUDY_QUERIES + '/v1/studies';
    console.debug(fetchStudiesUrl);
    return backendFetch(fetchStudiesUrl).then((response) => response.json());
}

export function fetchCases() {
    console.info('Fetching cases...');
    const fetchCasesUrl = PREFIX_CASE_QUERIES + '/v1/cases';
    console.debug(fetchCasesUrl);
    return backendFetch(fetchCasesUrl).then((response) => response.json());
}

export function getVoltageLevelSingleLineDiagram(
    studyName,
    voltageLevelId,
    useName,
    centerLabel,
    diagonalLabel
) {
    console.info(
        `Getting url of voltage level diagram '${voltageLevelId}' of study '${decodeURIComponent(studyName)}'...`
    );
    return (
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        studyName +
        '/network/voltage-levels/' +
        voltageLevelId +
        '/svg-and-metadata?' +
        new URLSearchParams({ useName: useName }).toString() +
        '&' +
        new URLSearchParams({ centerLabel: centerLabel }).toString() +
        '&' +
        new URLSearchParams({ diagonalLabel: diagonalLabel }).toString() +
        '&' +
        new URLSearchParams({ topologicalColoring: true }).toString()
    );
}

export function fetchSvg(svgUrl) {
    console.debug(svgUrl);
    return backendFetch(svgUrl).then((response) =>
        response.ok
            ? response.json()
            : response
                  .json()
                  .then((error) => Promise.reject(new Error(error.error)))
    );
}

export function fetchSubstations(studyName) {
    console.info(`Fetching substations of study '${decodeURIComponent(studyName)}'...`);
    const fetchSubstationsUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        studyName +
        '/network-map/substations';
    console.debug(fetchSubstationsUrl);
    return backendFetch(fetchSubstationsUrl).then((response) =>
        response.json()
    );
}

export function fetchSubstationPositions(studyName) {
    console.info(`Fetching substation positions of study '${decodeURIComponent(studyName)}'...`);
    const fetchSubstationPositionsUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyName) +
        '/geo-data/substations';
    console.debug(fetchSubstationPositionsUrl);
    return backendFetch(fetchSubstationPositionsUrl).then((response) =>
        response.json()
    );
}

export function fetchLines(studyName) {
    console.info(`Fetching lines of study '${decodeURIComponent(studyName)}'...`);
    const fetchLinesUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyName) +
        '/network-map/lines';
    console.debug(fetchLinesUrl);
    return backendFetch(fetchLinesUrl).then((response) => response.json());
}

export function fetchLinePositions(studyName) {
    console.info(`Fetching line positions of study '${decodeURIComponent(studyName)}'...`);
    const fetchLinePositionsUrl =
        PREFIX_STUDY_QUERIES + '/v1/studies/' + encodeURIComponent(studyName) + '/geo-data/lines';
    console.debug(fetchLinePositionsUrl);
    return backendFetch(fetchLinePositionsUrl).then((response) =>
        response.json()
    );
}

export function createStudy(
    caseExist,
    studyName,
    studyDescription,
    caseName,
    selectedFile
) {
    console.info('Creating a new study...');
    if (caseExist) {
        const createStudyWithExistingCaseUrl =
            PREFIX_STUDY_QUERIES +
            '/v1/studies/' +
            encodeURIComponent(studyName) +
            '/cases/' +
            caseName +
            '?' +
            new URLSearchParams({ description: studyDescription}).toString();
        console.debug(createStudyWithExistingCaseUrl);
        return backendFetch(createStudyWithExistingCaseUrl, {
            method: 'post',
        });
    } else {
        const createStudyWithNewCaseUrl =
            PREFIX_STUDY_QUERIES +
            '/v1/studies/' +
            encodeURIComponent(studyName) +
            '?' +
            new URLSearchParams({ description: studyDescription}).toString();
        const formData = new FormData();
        formData.append('caseFile', selectedFile);
        console.debug(createStudyWithNewCaseUrl);
        console.log(createStudyWithNewCaseUrl);
        return backendFetch(createStudyWithNewCaseUrl, {
            method: 'post',
            body: formData,
        });
    }
}

export function deleteStudy(studyName) {
    console.info('Deleting study ' + studyName + ' ...');
    const deleteStudyUrl = PREFIX_STUDY_QUERIES + '/v1/studies/' + encodeURIComponent(studyName);
    console.debug(deleteStudyUrl);
    return backendFetch(deleteStudyUrl, {
        method: 'delete',
    });
}

export function updateSwitchState(studyName, switchId, open) {
    console.info('updating switch ' + switchId + ' ...');
    const updateSwitchUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        studyName +
        '/network-modification/switches/' +
        switchId +
        '?' +
        new URLSearchParams({ open: open }).toString();
    console.debug(updateSwitchUrl);
    return backendFetch(updateSwitchUrl, { method: 'put' });
}

export function renameStudy(studyName, newStudyName) {
    console.info('Renaming study ' + studyName);
    const renameStudiesUrl =
        process.env.REACT_APP_API_STUDY_SERVER +
        '/v1/studies/' +
        encodeURIComponent(studyName) +
        '/rename';
    console.debug(renameStudiesUrl);
    return backendFetch(renameStudiesUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newStudyName: newStudyName }),
    }).then((response) => response.json());
}

export function startLoadFlow(studyName) {
    console.info('Running loadflow on ' + decodeURIComponent(studyName) + '...');
    const startLoadFlowUrl =    
        PREFIX_STUDY_QUERIES + '/v1/studies/' + studyName + '/loadflow/run';
    console.debug(startLoadFlowUrl);
    return backendFetch(startLoadFlowUrl, { method: 'put' });
}

export function connectNotificationsWebsocket(studyName) {
    // The websocket API doesn't allow relative urls
    const wsbase = document.baseURI
        .replace(/^http:\/\//, 'ws://')
        .replace(/^https:\/\//, 'wss://');
    const wsadress =
        wsbase + PREFIX_NOTIFICATION_WS + '/notify?studyName=' + decodeURIComponent(studyName);
    let wsaddressWithToken;
    if (process.env.REACT_APP_USE_AUTHENTICATION === 'true') {
        wsaddressWithToken = wsadress + '&access_token=' + getToken();
    } else {
        wsaddressWithToken = wsadress;
    }
    const rws = new ReconnectingWebSocket(wsaddressWithToken);
    // don't log the token, it's private
    rws.onopen = function (event) {
        console.info('Connected Websocket ' + wsadress + ' ...');
    };
    return rws;
}

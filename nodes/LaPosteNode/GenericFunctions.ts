import {
    IExecuteFunctions,
    IExecuteSingleFunctions,
    IHookFunctions,
    ILoadOptionsFunctions,
    IWebhookFunctions,
} from 'n8n-core';
import {
    IDataObject,
    ICredentialDataDecryptedObject
} from 'n8n-workflow';
import {OptionsWithUri} from "request-promise-native";

export async function getDeliveryStatus(this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IWebhookFunctions, trackingNumber: string, lang: string = "fr_FR"): Promise<any> {
    return laposteApiRequest.call(this, `/suivi/v2/idships/${trackingNumber}`, {lang});
}

export async function checkAddressValidity(this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IWebhookFunctions, address: string): Promise<any> {
    return laposteApiRequest.call(this, `/controladresse/v1/adresses`, {q: address});
}

export async function laposteApiRequest(this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IWebhookFunctions, resource: string, qs: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any
    const credentials = this.getCredentials('laPosteApi');
    if (credentials === undefined) {
        throw new Error('No credentials got returned!');
    }
    let options: OptionsWithUri = {
        method: 'GET',
        headers: {
            'X-Okapi-Key': credentials.apiKey as string,
            'Accept': 'application/json',
        },
        qs,
        encoding: 'latin1',
        uri: `https://api.laposte.fr${resource}`,
        json: true
    };

    try {
        return await this.helpers.request!(options);
    } catch (error) {
        if (error.statusCode === 401) {
            // Return a clear error
            throw new Error('The API Key is not valid!');
        }

        if (error.response.body && error.response.body.message) {
            // Try to return the error prettier
            throw new Error(`La Poste Error [${error.statusCode}]: ${error.response.body.message}`);
        }

        // If that data does not exist for some reason return the actual error
        throw new Error('WooCommerce Error: ' + error.message);
    }
}

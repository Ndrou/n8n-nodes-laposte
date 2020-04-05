import {
    ICredentialType,
    NodePropertyTypes,
} from 'n8n-workflow';

export class LaPosteApi implements ICredentialType {
    name = 'laPosteApi';
    displayName = 'La Poste API';
    properties = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string' as NodePropertyTypes,
            default: '',
        },
    ];
}

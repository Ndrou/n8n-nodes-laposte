import {IExecuteFunctions} from 'n8n-core';
import {
    IDataObject,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import {checkAddressValidity, getDeliveryStatus} from "./GenericFunctions";

export class LaPosteNode implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'La Poste',
        name: 'laposte',
        icon: 'file:laposte.png',
        group: ['transform'],
        version: 1,
        description: 'Consume La Poste API',
        defaults: {
            name: 'La Poste',
            color: '#772244',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'laPosteApi',
                required: true,
            }
        ],
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                options: [
                    {
                        name: 'Check address',
                        value: 'address',
                    },
                    {
                        name: 'Check delivery status',
                        value: 'delivery',
                    },
                ],
                required: true,
                default: 'delivery',
                description: 'Operation type',
            },
            {
                displayName: 'Address',
                name: 'address',
                type: 'string',
                description: 'The complete address to verify.',
                displayOptions: {
                    show: {
                        operation: [
                            'address',
                        ],
                    },
                },
                default: '',
            },
            {
                displayName: 'Tracking number',
                name: 'tracking_number',
                type: 'string',
                description: 'The tracking number.',
                displayOptions: {
                    show: {
                        operation: [
                            'delivery',
                        ],
                    },
                },
                default: '',
            },
            {
                displayName: 'Language (ISO)',
                name: 'lang',
                type: 'string',
                default: 'fr_FR',
                required: true,
                displayOptions: {
                    show: {
                        operation: [
                            'delivery',
                        ],
                    },
                },
                description: 'Operation type',
            },
        ]
    };


    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: IDataObject[] = [];
        let responseData;
        const length = items.length as unknown as number;

        const operation = this.getNodeParameter('operation', 0) as string;

        for (let i = 0; i < length; i++) {
            if (operation === 'delivery') {
                const trackingNumber = this.getNodeParameter('tracking_number', i) as string;
                const lang = this.getNodeParameter('lang', i) as string;
                try {
                    responseData = await getDeliveryStatus.call(this, trackingNumber, lang);
                } catch (err) {
                    responseData = null;
                }
            } else if (operation === 'address') {
                const address = this.getNodeParameter('address', i) as string;
                const addressesFound = await checkAddressValidity.call(this, address);

                 responseData = {
                     results: addressesFound,
                 };
            }

            returnData.push(responseData as IDataObject);
        }

        return [this.helpers.returnJsonArray(returnData)];
    }
}

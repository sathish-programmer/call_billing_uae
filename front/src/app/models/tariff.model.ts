export interface Tariff {
    calculationType: string,
    countryCode: string,
    creationDate: string,
    currency: string,
    externalId: string,
    name: string,
    organization: string,
    priority: string,
    provider: any,
    timeZone: any,
    trunkId?: string,
    type: string,
    units: number
    unitsMeasurement: string
    _id: string
}
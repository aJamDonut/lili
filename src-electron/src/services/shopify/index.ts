import axios from 'axios';
import { getLicenseKey } from '../settings';
interface License {
  type: string;
  creation_date: string;
  delivered_date: string;
  available: boolean;
  order: Order;
  product: Product;
}

interface Order {
  email: string;
  name: string;
  total_price: string;
  customer: Customer;
}

interface Customer {
  id: number;
  email: string;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  state: string;
  note: string | null;
  verified_email: boolean;
  multipass_identifier: string | null;
  tax_exempt: boolean;
  phone: string | null;
  email_marketing_consent: EmailMarketingConsent | null;
  sms_marketing_consent: any; // Update this type if necessary
  tags: string;
  currency: string;
  accepts_marketing_updated_at: string;
  marketing_opt_in_level: string | null; // Update this type if necessary
  tax_exemptions: any[]; // Update this type if necessary
  admin_graphql_api_id: string;
  default_address: Address;
}

interface EmailMarketingConsent {
  state: string;
  opt_in_level: string;
  consent_updated_at: string | null;
}

interface Address {
  id: number;
  customer_id: number;
  first_name: string;
  last_name: string;
  company: string | null;
  province: string;
  country: string;
  phone: string | null;
  name: string;
  province_code: string;
  country_code: string;
  country_name: string;
  default: boolean;
}

interface Product {
  id: number;
  title: string;
  sku: string;
}

interface ResponseData {
  license_key: License;
  status: string;
}

interface Response {
  data: ResponseData;
}
const api = axios.create({
  baseURL: 'https://app-easy-product-downloads.fr/api',
});

export interface ValidLicenseResponse {
  valid: boolean;
  reason?: string;
}

function licenseError(error: string): ValidLicenseResponse {
  return {
    valid: false,
    reason: error || 'Invalid license',
  };
}

function licenseValid(): ValidLicenseResponse {
  return {
    valid: true,
  };
}

const PRODUCT_ID = 8485329699132;
const API_TOKEN = 'nnO9U2jLeAFsKmWwYvg2RGfH2dEbIiWNsEoBwTjwdrYWruJjVOVtmBKZQNS0';

function validateLicense(license: ResponseData) {
  if (PRODUCT_ID != license.license_key.product.id) {
    //In valid product
    return licenseError('Invalid license for this product');
  }

  //Everything passed, return a good result!
  activeLicense = licenseValid();

  return activeLicense;
}

let activeLicense = licenseError('');
unsetLicense();

export async function getLicense(licenseKey: string, invalidate: boolean = false) {
  if (!licenseKey) {
    return licenseError('Not valid license provided');
  }

  //Reduce calls by checking if license already valid
  if (activeLicense.valid && !invalidate) {
    return activeLicense; //If the license is already active, always return true.
  }
  try {
    const license = (await api.post('/get-license-key', null, {
      timeout: 1000 * 5,
      params: {
        license_key: licenseKey,
        api_token: API_TOKEN,
      },
    })) as Response;
    console.log(license.data);
    return validateLicense(license.data);
  } catch (e) {
    console.error(e);
    console.error("Can't find license.");
    return licenseError("Can't find this license");
  }
}

export async function hasValidLicense() {
  return await getLicense(await getLicenseKey());
}

export async function unsetLicense() {
  activeLicense = licenseError('Not initialized');
  return activeLicense;
}

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const SKIPCASH_SECRET_KEY = process.env.SKIPCASH_SECRET_KEY!;
const SKIPCASH_KEY_ID = process.env.SKIPCASH_KEY_ID!;
const SKIPCASH_CLIENT_ID = process.env.SKIPCASH_CLIENT_ID!;
const SKIPCASH_SANDBOX_URL = 'https://skipcashtest.azurewebsites.net';
const SKIPCASH_RETURN_URL = process.env.SKIPCASH_RETURN_URL!;
const SKIPCASH_WEBHOOK_URL = process.env.SKIPCASH_WEBHOOK_URL!;


interface PaymentDetails {
  amount: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  transactionId: string;
  custom1?: string;
}

export async function createSkipCashPayment(details: PaymentDetails) {
  const uid = uuidv4();

  const paymentData = {
    Uid: uid,
    KeyId: SKIPCASH_KEY_ID,
    Amount: details.amount,
    FirstName: details.firstName,
    LastName: details.lastName,
    Phone: details.phone,
    Email: details.email,
    Street: '',
    City: '',
    State: '',
    Country: '',
    PostalCode: '',
    TransactionId: details.transactionId,
    Custom1: details.custom1 || '',
    ReturnUrl: SKIPCASH_RETURN_URL,
    WebhookUrl: SKIPCASH_WEBHOOK_URL,
    SaveCard     : true  //
  };

  const combinedData = `Uid=${paymentData.Uid},KeyId=${paymentData.KeyId},Amount=${paymentData.Amount},FirstName=${paymentData.FirstName},LastName=${paymentData.LastName},Phone=${paymentData.Phone},Email=${paymentData.Email},Street=${paymentData.Street},City=${paymentData.City},State=${paymentData.State},Country=${paymentData.Country},PostalCode=${paymentData.PostalCode},TransactionId=${paymentData.TransactionId},Custom1=${paymentData.Custom1},ReturnUrl=${paymentData.ReturnUrl},WebhookUrl=${paymentData.WebhookUrl}`;

  const hash = crypto
    .createHmac('sha256', SKIPCASH_SECRET_KEY)
    .update(combinedData)
    .digest('base64');
  const response = await fetch(`${SKIPCASH_SANDBOX_URL}/api/v1/payments`, {
    method: 'POST',
    headers: {
      Authorization: hash,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  const result = await response.json();
  return result;
}

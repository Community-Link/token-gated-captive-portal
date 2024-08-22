"use server"

import fetch from 'node-fetch';
import https from "https";
import { headers } from 'next/headers';

export async function getAccountingFreeRadius (username: string) {
    try {
        const headersList = headers(); // Get the headers from the incoming request
        const csrfToken = headersList.get("X-CSRFToken")
        const agent = new https.Agent({
            rejectUnauthorized: false, // Allow self-signed certificates
        });
        const response = await fetch(`${process.env.BASE_URL}/api/v1/freeradius/accounting/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Bearer ${process.env.UUID} ${process.env.TOKEN}`,
            },
            body: JSON.stringify({
                username: username,
            }),
            agent: agent,
        });
        const data =  await response.json()
        console.log('accounting', data)
    } catch (error) {
        console.log('accounting', error)   
    }
}